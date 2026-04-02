#!/bin/bash
# finanzas.pop — genera y publica 1 post automáticamente
cd /Users/martin/Projects/Startrader
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
node engine/run.mjs --count 1 >> /tmp/finanzas-pop-engine.log 2>&1
