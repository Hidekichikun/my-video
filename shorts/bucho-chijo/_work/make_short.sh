# usage: make_short.sh START END OUTNAME
S=$1; E=$2; D=$(python3 -c "print($E-$S)"); FO=$(python3 -c "print($E-$S-0.4)")
ffmpeg -v error -y -ss $S -t $D -i "../../../out/部長、ここは地上です！_MV.mp4" -loop 1 -i overlay.png \
 -filter_complex "[0:v]scale=1080:608:flags=lanczos,setsar=1[mv];[1:v][mv]overlay=0:700:shortest=1,fps=30,format=yuv420p,fade=t=in:st=0:d=0.15,fade=t=out:st=$FO:d=0.4[v];[0:a]afade=t=in:st=0:d=0.2,afade=t=out:st=$FO:d=0.4[a]" \
 -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset medium -c:a aac -b:a 192k -movflags +faststart "../$3"
