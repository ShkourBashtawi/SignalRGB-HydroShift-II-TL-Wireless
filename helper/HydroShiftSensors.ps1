<#
HydroShift Sensors helper
-------------------------
Reads CPU / GPU temperature and load once a second and sends them as a small
JSON packet to the SignalRGB "Lian Li HydroShift II (Wireless)" plugin on
127.0.0.1:51870 (UDP, this PC only). The plugin shows them on the AIO's LCD.

Sources, best first:
  1. LibreHardwareMonitor's web server (http://localhost:8085/data.json), if running.
     Gives every value, including the real CPU temperature.
  2. Built into Windows / drivers, no extra software:
       CPU load  - Windows performance counters
       GPU load  - Windows "GPU Engine" counters (any GPU)
       GPU temp  - nvidia-smi (NVIDIA only)
       CPU temp  - not available without LibreHardwareMonitor. (-UseAcpiZone reads the
                   ACPI thermal zone instead; on most boards that is a fixed or
                   unrelated value, so it is off by default.)

Usage:
  powershell -ExecutionPolicy Bypass -File HydroShiftSensors.ps1            # run (Ctrl+C to stop)
  powershell -ExecutionPolicy Bypass -File HydroShiftSensors.ps1 -Once      # print one reading and exit
  powershell -ExecutionPolicy Bypass -File HydroShiftSensors.ps1 -Console   # run and print every reading

License: MIT. Part of SignalRGB-HydroShift-II-TL-Wireless.
#>
[CmdletBinding()]
param(
    [int]$Port = 51870,
    [string]$LhmUrl = "http://localhost:8085/data.json",
    [int]$IntervalMs = 1000,
    [string]$LogDir = "",
    [switch]$UseAcpiZone,
    [switch]$Once,
    [switch]$Console
)

$ErrorActionPreference = "Stop"
$Version = "1.4.0"
$Inv = [System.Globalization.CultureInfo]::InvariantCulture

if (-not $LogDir) { $LogDir = Join-Path $env:LOCALAPPDATA "HydroShiftSensors" }
$LogFile = Join-Path $LogDir "helper.log"

function Write-Log([string]$msg) {
    $line = "{0}  {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $msg
    if ($Console -or $Once) { Write-Host $line }
    try {
        if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
        if ((Test-Path $LogFile) -and ((Get-Item $LogFile).Length -gt 512KB)) {
            Move-Item $LogFile "$LogFile.old" -Force
        }
        Add-Content -Path $LogFile -Value $line -Encoding UTF8
    } catch { }
}

# ------------------------------------------------------------------ LHM ----

function ConvertTo-Number([string]$text) {
    if (-not $text) { return $null }
    $m = [regex]::Match($text, "-?\d+(?:[.,]\d+)?")
    if (-not $m.Success) { return $null }
    return [double]::Parse($m.Value.Replace(",", "."), $Inv)
}

function Get-LhmSensors($node, $list) {
    if ($null -ne $node.SensorId -and $node.SensorId) {
        $list.Add([pscustomobject]@{
            Id    = [string]$node.SensorId
            Type  = [string]$node.Type
            Text  = [string]$node.Text
            Value = ConvertTo-Number ([string]$node.Value)
        }) | Out-Null
    }
    foreach ($child in @($node.Children)) {
        if ($null -ne $child) { Get-LhmSensors $child $list }
    }
}

function Select-Sensor($sensors, [string]$idPattern, [string]$type, [string[]]$preferredNames, [switch]$Max) {
    $candidates = @($sensors | Where-Object { $_.Id -match $idPattern -and $_.Type -eq $type -and $null -ne $_.Value })
    if (-not $candidates.Count) { return $null }
    foreach ($name in $preferredNames) {
        $hit = $candidates | Where-Object { $_.Text -like $name } | Select-Object -First 1
        if ($hit) { return $hit.Value }
    }
    if ($Max) { return ($candidates | Measure-Object -Property Value -Maximum).Maximum }
    return $candidates[0].Value
}

function Read-Lhm {
    try {
        $req = [System.Net.WebRequest]::Create($LhmUrl)
        $req.Timeout = 400
        $req.Proxy = $null
        $resp = $req.GetResponse()
        try {
            $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
            $json = $reader.ReadToEnd()
        } finally { $resp.Close() }
    } catch {
        return $null
    }
    $root = $json | ConvertFrom-Json
    $sensors = New-Object System.Collections.ArrayList
    Get-LhmSensors $root $sensors
    if (-not $sensors.Count) { return $null }
    $cpu = "^/(amdcpu|intelcpu|cpu)/"
    $gpu = "^/gpu-(nvidia|amd|intel)/"
    return @{
        cpu_temp = Select-Sensor $sensors $cpu "Temperature" @("Core (Tctl/Tdie)", "CPU Package", "Core (Tctl)", "Package", "Core Average", "Core Max") -Max
        cpu_load = Select-Sensor $sensors $cpu "Load" @("CPU Total", "Total")
        gpu_temp = Select-Sensor $sensors $gpu "Temperature" @("GPU Core", "GPU Temperature", "Core") -Max
        gpu_load = Select-Sensor $sensors $gpu "Load" @("GPU Core", "D3D 3D", "Core")
        source   = "LibreHardwareMonitor"
    }
}

# ------------------------------------------------------- Windows built-in --

$script:CpuCounter = $null
$script:GpuCounters = @{}
$script:GpuRefreshAt = [datetime]::MinValue
$script:ZoneCounters = $null
$script:NvidiaSmi = $null

function Initialize-Builtin {
    foreach ($spec in @(@("Processor Information", "% Processor Utility", "_Total"), @("Processor", "% Processor Time", "_Total"))) {
        try {
            $c = New-Object System.Diagnostics.PerformanceCounter($spec[0], $spec[1], $spec[2], $true)
            [void]$c.NextValue()
            $script:CpuCounter = $c
            break
        } catch { }
    }
    try {
        $cat = New-Object System.Diagnostics.PerformanceCounterCategory("Thermal Zone Information")
        $script:ZoneCounters = @()
        foreach ($inst in $cat.GetInstanceNames()) {
            # "High Precision Temperature" is tenths of a kelvin (Win10 1903+); "Temperature" is whole kelvins.
            try {
                $c = New-Object System.Diagnostics.PerformanceCounter("Thermal Zone Information", "High Precision Temperature", $inst, $true)
                [void]$c.NextValue()
                $script:ZoneCounters += @{ Counter = $c; Div = 10.0 }
            } catch {
                try {
                    $c = New-Object System.Diagnostics.PerformanceCounter("Thermal Zone Information", "Temperature", $inst, $true)
                    [void]$c.NextValue()
                    $script:ZoneCounters += @{ Counter = $c; Div = 1.0 }
                } catch { }
            }
        }
    } catch { $script:ZoneCounters = @() }
    foreach ($p in @("$env:SystemRoot\System32\nvidia-smi.exe", "$env:ProgramFiles\NVIDIA Corporation\NVSMI\nvidia-smi.exe")) {
        if (Test-Path $p) { $script:NvidiaSmi = $p; break }
    }
}

function Update-GpuCounters {
    if ((Get-Date) -lt $script:GpuRefreshAt) { return }
    $script:GpuRefreshAt = (Get-Date).AddSeconds(10)
    try {
        $cat = New-Object System.Diagnostics.PerformanceCounterCategory("GPU Engine")
        $names = @($cat.GetInstanceNames() | Where-Object { $_ -like "*engtype_3D" })
    } catch { $names = @() }
    $next = @{}
    foreach ($n in $names) {
        if ($script:GpuCounters.ContainsKey($n)) { $next[$n] = $script:GpuCounters[$n]; continue }
        try {
            $c = New-Object System.Diagnostics.PerformanceCounter("GPU Engine", "Utilization Percentage", $n, $true)
            [void]$c.NextValue()
            $next[$n] = $c
        } catch { }
    }
    foreach ($k in @($script:GpuCounters.Keys)) {
        if (-not $next.ContainsKey($k)) { try { $script:GpuCounters[$k].Dispose() } catch { } }
    }
    $script:GpuCounters = $next
}

function Read-Builtin {
    $r = @{ cpu_temp = $null; cpu_load = $null; gpu_temp = $null; gpu_load = $null; source = "Windows" }
    $parts = @("Windows counters")

    if ($script:CpuCounter) {
        try { $r.cpu_load = [math]::Min(100, $script:CpuCounter.NextValue()) } catch { }
    }

    Update-GpuCounters
    if ($script:GpuCounters.Count) {
        # Task Manager style: per adapter (luid), sum of 3D engine use; report the busiest adapter.
        $perAdapter = @{}
        foreach ($k in @($script:GpuCounters.Keys)) {
            try { $v = $script:GpuCounters[$k].NextValue() } catch { continue }
            $luid = ([regex]::Match($k, "luid_0x[0-9a-fA-F]+_0x[0-9a-fA-F]+")).Value
            if (-not $perAdapter.ContainsKey($luid)) { $perAdapter[$luid] = 0.0 }
            $perAdapter[$luid] += $v
        }
        if ($perAdapter.Count) {
            $r.gpu_load = [math]::Min(100, ($perAdapter.Values | Measure-Object -Maximum).Maximum)
        }
    }

    if ($script:NvidiaSmi) {
        try {
            $out = & $script:NvidiaSmi --query-gpu=temperature.gpu,utilization.gpu --format=csv,noheader,nounits 2>$null | Select-Object -First 1
            $bits = "$out".Split(",")
            if ($bits.Count -ge 2) {
                $r.gpu_temp = [double]::Parse($bits[0].Trim(), $Inv)
                $r.gpu_load = [double]::Parse($bits[1].Trim(), $Inv)
                $parts += "nvidia-smi"
            }
        } catch { }
    }

    if ($UseAcpiZone -and $script:ZoneCounters -and $script:ZoneCounters.Count) {
        $best = $null
        foreach ($z in $script:ZoneCounters) {
            try {
                $c = $z.Counter.NextValue() / $z.Div - 273.15
                if ($c -gt 5 -and $c -lt 115 -and ($null -eq $best -or $c -gt $best)) { $best = $c }
            } catch { }
        }
        if ($null -ne $best) { $r.cpu_temp = $best; $parts += "ACPI zone" }
    }

    $r.source = ($parts -join " + ")
    return $r
}

# ------------------------------------------------------------------ main ---

function Format-Value($v) {
    if ($null -eq $v) { return "null" }
    return ([math]::Round([double]$v, 1)).ToString($Inv)
}

function ConvertTo-Packet($r) {
    $src = ([string]$r.source).Replace('"', "'")
    return ('{{"cpu_temp":{0},"cpu_load":{1},"gpu_temp":{2},"gpu_load":{3},"source":"{4}","v":"{5}"}}' -f `
        (Format-Value $r.cpu_temp), (Format-Value $r.cpu_load), (Format-Value $r.gpu_temp), (Format-Value $r.gpu_load), $src, $Version)
}

# Only the long-running copy takes the single-instance lock. A -Once test run
# must never hold it, otherwise the startup task can see "already running"
# and quit while the test is still reading sensors.
$mutex = $null
$owned = $false
if (-not $Once) {
    $mutex = New-Object System.Threading.Mutex($false, "Global\HydroShiftSensorsHelper")
    try { $owned = $mutex.WaitOne(0) } catch [System.Threading.AbandonedMutexException] { $owned = $true }
    if (-not $owned) {
        Write-Log "Another copy is already running. Exiting."
        exit 0
    }
}

Initialize-Builtin
$udp = New-Object System.Net.Sockets.UdpClient
$udp.Connect("127.0.0.1", $Port)
Write-Log ("HydroShift Sensors {0} started. Sending to 127.0.0.1:{1}. CPU counter: {2}, thermal zones: {3}, nvidia-smi: {4}" -f `
    $Version, $Port, [bool]$script:CpuCounter, @($script:ZoneCounters).Count, [bool]$script:NvidiaSmi)
if (-not (Read-Lhm)) {
    Write-Log "LibreHardwareMonitor web server not found at $LhmUrl - CPU temperature will show as '--'. See README."
}

$lastSource = ""
$lastStatus = [datetime]::MinValue
$first = $true
try {
    while ($true) {
        $started = Get-Date
        $reading = Read-Lhm
        if (-not $reading) { $reading = Read-Builtin }
        if ($first) {
            # Rate counters need two samples; the first builtin reading is not meaningful.
            $first = $false
            Start-Sleep -Milliseconds 500
            if ($reading.source -ne "LibreHardwareMonitor") { $reading = Read-Builtin }
        }
        $packet = ConvertTo-Packet $reading
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($packet)
        try { [void]$udp.Send($bytes, $bytes.Length) } catch { }

        if ($Once) { Write-Output $packet; break }
        if ($Console) { Write-Log $packet }
        if ($reading.source -ne $lastSource) {
            Write-Log "Source: $($reading.source)"
            $lastSource = $reading.source
        }
        if (((Get-Date) - $lastStatus).TotalMinutes -ge 10) {
            Write-Log "Sending $packet"
            $lastStatus = Get-Date
        }
        $spent = ((Get-Date) - $started).TotalMilliseconds
        Start-Sleep -Milliseconds ([int][math]::Max(100, $IntervalMs - $spent))
    }
} finally {
    $udp.Close()
    if ($owned -and $mutex) { try { $mutex.ReleaseMutex() } catch { } }
}
