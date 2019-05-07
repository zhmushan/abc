#!/bin/sh

ABC_ADD=$3
ABC_FIND=$4
KOA_ADD=$5
KOA_FIND=$6

cat  << EOF
| Name       | Add(ms)  | Find(ms)  |
| ---------- | -------- | --------- |
| abc        | $ABC_ADD | $ABC_FIND |
| koa-router | $KOA_ADD | $KOA_FIND |
EOF
