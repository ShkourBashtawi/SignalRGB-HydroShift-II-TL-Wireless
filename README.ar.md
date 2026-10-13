# SignalRGB × HydroShift II + UNI FAN TL Wireless — دليل سريع

تحكّم بإضاءة **HydroShift II** وفانات **UNI FAN Wireless** من **SignalRGB** مباشرة، ومتزامنة مع باقي جهازك.

> ⚠️ مشروع مجتمعي، مش تابع لـ Lian Li ولا لـ SignalRGB.

---

## قبل ما تبلّش

- لازم **L-Connect 3 يكون مسكّر كامل**، ومعه الـ service تبعه.
- وهو مسكّر رح توقف عندك **الشاشة ومنحنيات سرعة الفانات والمضخة**. عشان هيك **ثبّت السرعات اللي بدك إياها بـ L-Connect قبل ما تسكّره**.
- طفّي **Motherboard RGB Sync** للأجهزة من L-Connect.

### توقيف L-Connect بشكل دائم (مرة وحدة)

1. ثبّت السرعات بـ L-Connect 3، وسكّره من الـ tray.
2. اضغط `Win + R` واكتب `services.msc`.
3. افتح **L-Connect Service**، وخلّي **Startup type** على **Manual**، واضغط **Stop** ثم **OK**.

---

## التركيب

1. افتح SignalRGB ← **الإعدادات** ← **Add-ons**.
2. اضغط **Add Add-on** والصق الرابط:
   ```
   https://github.com/ShkourBashtawi/SignalRGB-HydroShift-II-TL-Wireless
   ```
3. اعمل Restart لـ SignalRGB.

رح يظهرلك جهازين جداد:
- **Lian Li Wireless RX (Finder)**: بيقرأ أجهزتك وبيعطيك القيم اللي بتحتاجها.
- **Lian Li HydroShift II (Wireless)**: هاد اللي بيبعت الإضاءة.

---

## الإعداد (دقيقتين)

### 1. خذ القيم من الـ Finder

افتح **Lian Li Wireless RX (Finder)** واضغط أيقونة **`>_`** فوق على اليمين. رح تشوف شي زي:

```
[PUMP] HydroShift II LCD-S (Wireless)  MAC e7:f5:f3:e5:66:e1  RX slot 2  channel 39
[FANS] UNI FAN TL Wireless x3 (26 LEDs/fan)  MAC 81:0c:73:e5:66:e1  RX slot 1  channel 39
```

### 2. حطّها بجهاز HydroShift II ← الإعدادات

| الإعداد | من وين | مثال |
|---|---|---|
| Pump MAC | سطر `[PUMP]` ← MAC | `e7:f5:f3:e5:66:e1` |
| Pump RX Slot | سطر `[PUMP]` ← RX slot | `2` |
| Fans MAC | سطر `[FANS]` ← MAC | `81:0c:73:e5:66:e1` |
| Fans RX Slot | سطر `[FANS]` ← RX slot | `1` |
| Fan Count | سطر `[FANS]` ← x3 | `3` |
| LEDs per Fan | سطر `[FANS]` ← LEDs/fan | `26` |
| Device Channel | channel | `39` |
| TX Master Channel | خلّيه | `Auto` |
| Updates per Second | حسب ذوقك | `15` |

> **قيمك غير الأمثلة.** كل جهاز إله MAC خاص فيه.

### 3. جرّب

حط **Lighting Mode** على **Forced** واختار لون. المضخة والفانات لازم يتغيروا خلال ثانية. بعدها رجّعه لـ **Canvas**.

الإعدادات بتنحفظ، فبتعملها مرة وحدة بس.

---

## مشاكل وحلول

| المشكلة | الحل |
|---|---|
| الجهازين ما ظهروا | `L-Connect-Service.exe` لسا شغال. وقّفه واعمل Restart لـ SignalRGB |
| الـ Finder بيقول ما في أجهزة | لازم الأجهزة تكون شغالة ومربوطة بالدونجل. اربطها مرة بـ L-Connect وسكّره |
| الألوان ما بتتغير | تأكد من الـ MAC والـ RX Slot والـ Device Channel |
| بطّل يشتغل بعد restart للويندوز | الـ service رجع اشتغل. خلّيه Manual |
| الحركة متقطعة | Updates per Second خلّيه `15` أو `18` |

**عن النعومة:** النظام اللاسلكي أقصاه تقريباً 15 لـ 18 تحديث بالثانية. التأثيرات البطيئة والمتوسطة بتطلع ممتازة، والسريعة جداً ممكن يبين فيها تقطيع خفيف.

---

## شكر

- البروتوكول: [sgtaziz/lian-li-linux](https://github.com/sgtaziz/lian-li-linux)
- الضغط: [sisong/tinyuz](https://github.com/sisong/tinyuz)
