#!/usr/bin/env bash
# Runs every check. Needs node, gcc/g++ and the tinyuz + HDiffPatch sources
# (git clone https://github.com/sisong/tinyuz and https://github.com/sisong/HDiffPatch
#  into ./vendor, or set VENDOR=/path/to/dir-containing-both).
set -euo pipefail
cd "$(dirname "$0")"
VENDOR="${VENDOR:-../vendor}"
if [ ! -x tools/tuzdec ]; then
  gcc -O2 -w -I"$VENDOR/tinyuz" -o tools/tuzdec tools/tuzdec.c "$VENDOR/tinyuz/decompress/tuz_dec.c"
  gcc -O2 -w -Dtuz_isNeedLiteralLine=0 -I"$VENDOR/tinyuz" -o tools/tuzdec_nolit tools/tuzdec.c "$VENDOR/tinyuz/decompress/tuz_dec.c"
fi
if [ ! -x tools/tuzenc ]; then
  g++ -O2 -w -D_IS_USED_MULTITHREAD=0 -DNDEBUG -I"$VENDOR" -I"$VENDOR/tinyuz" -I"$VENDOR/HDiffPatch" -o tools/tuzenc tools/tuzenc.cpp \
    tools/tuz_wrapper.cpp "$VENDOR/tinyuz/compress/tuz_enc.cpp" "$VENDOR"/tinyuz/compress/tuz_enc_private/*.cpp \
    "$VENDOR/HDiffPatch/libHDiffPatch/HDiff/private_diff/libdivsufsort/divsufsort.cpp"
fi
(cd .. && python3 build.py >/dev/null)
node tuz_roundtrip.cjs | tail -1
node packets_vs_rust.cjs
node effect_index_vs_rust.cjs | tail -1
node real_reply.cjs | tail -1
node e2e_sim.cjs | tail -1
node aio_vs_rust.cjs | tail -1
node e2e_lcd.cjs | tail -1
node pwm_vs_rust.cjs | tail -1
node e2e_fan.cjs | tail -1
node e2e_auto.cjs | tail -1
node e2e_fan_auto.cjs | tail -1
node pic_vs_rust.cjs | tail -1
