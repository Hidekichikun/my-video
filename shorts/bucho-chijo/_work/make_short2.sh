# usage: make_short2.sh SRC START END OVERLAY OUT
S=$2; E=$3; D=$(python3 -c "print($E-$S)"); FO=$(python3 -c "print($E-$S-0.4)")
ffmpeg -v error -y -ss $S -t $D -i "$1" -loop 1 -i "$4" \
 -filter_complex "[0:v]scale=1080:608:flags=lanczos,setsar=1[mv];[1:v][mv]overlay=0:700:shortest=1,fps=30,format=yuv420p,fade=t=in:st=0:d=0.15,fade=t=out:st=$FO:d=0.4[v];[0:a]afade=t=in:st=0:d=0.2,afade=t=out:st=$FO:d=0.4[a]" \
 -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset medium -c:a aac -b:a 192k -movflags +faststart "$5"
