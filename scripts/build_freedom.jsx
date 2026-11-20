// build_freedom.jsx
// Auto-creates a lyric motion setup for "ふりーだむ" using provided assets.
// Run in After Effects: File > Scripts > Run Script File...
(function() {
    var proj = app.project || app.newProject();
    if (!app.project) app.newProject();

    app.beginUndoGroup("build_freedom");

    // Paths (adjust if needed)
    var base = "C:/Users/hiden/my-video";
    var musicPath = base + "/music/ふりーだむ.mp3";
    var imgSoft = base + "/photo/ふりーだむ/u2944115231_a_cute_pastel_goth_anime_girl_with_pigtails_smili_9a8df4f9-b617-46eb-88c1-14c400972e91_3.png";
    var imgNeon = base + "/photo/ふりーだむ/u2944115231_a_cute_pastel_goth_anime_girl_with_pigtails_smili_a7635260-938a-4846-8add-8cf5e9b42b35_0.png";

    function importIfExists(path) {
        var f = new File(path);
        if (!f.exists) return null;
        return proj.importFile(new ImportOptions(f));
    }

    var audioItem = importIfExists(musicPath);
    var softItem = importIfExists(imgSoft);
    var neonItem = importIfExists(imgNeon);

    var compW = 1080, compH = 1920, compDur = 180, fps = 30;
    var mainComp = proj.items.addComp("MASTER_1080x1920", compW, compH, 1, compDur, fps);

    // Background solids
    var bgSolid = mainComp.layers.addSolid([0.04,0.04,0.04], "BG_Dark", compW, compH, 1, compDur);
    bgSolid.moveToEnd();

    if (softItem) {
        var softLayer = mainComp.layers.add(softItem);
        softLayer.name = "IMG_Soft";
        softLayer.property("Scale").setValue([120,120]);
        softLayer.property("Opacity").setValue(60);
        softLayer.property("Effects").addProperty("ADBE Gaussian Blur 2").property("Blurriness").setValue(25);
        softLayer.moveAfter(bgSolid);
    }

    if (neonItem) {
        var neonLayer = mainComp.layers.add(neonItem);
        neonLayer.name = "IMG_Neon";
        neonLayer.property("Scale").setValue([115,115]);
        neonLayer.property("Opacity").setValue(70);
        neonLayer.enabled = false; // enable on chorus cues
        neonLayer.moveAfter(bgSolid);
    }

    if (audioItem) {
        var audioLayer = mainComp.layers.add(audioItem);
        audioLayer.startTime = 0;
    }

    var lyrics = [
        {t:9.56, text:"息を止めるたび"},
        {t:13.62, text:"「こうあるべき」が増えてく"},
        {t:18.06, text:"名前を付けられて"},
        {t:21.28, text:"安心したふりをしてた"},
        {t:26.54, text:"ノイズみたいな声"},
        {t:28.42, text:"全部シャットアウトして"},
        {t:30.93, text:"胸の奥で鳴ってる"},
        {t:33.46, text:"このビートだけ信じて"},
        {t:35.53, text:"縛る手を"},
        {t:38.08, text:"ほどくたび"},
        {t:40.40, text:"心拍が"},
        {t:44.02, text:"檻はいらない"},
        {t:46.36, text:"正解もいらない"},
        {t:48.48, text:"この衝動が"},
        {t:50.12, text:"あたしを連れていく"},
        {t:53.30, text:"壊れてもいい"},
        {t:55.27, text:"迷ってもいい"},
        {t:57.48, text:"選んだ瞬間が"},
        {t:60.67, text:"「自由」になる"},
        {t:105.69, text:"きれいな言葉で"},
        {t:107.41, text:"守られるより"},
        {t:108.57, text:"不器用なままで"},
        {t:110.02, text:"前に出たい"},
        {t:114.77, text:"誰かの地図じゃ"},
        {t:117.38, text:"辿り着けない"},
        {t:119.46, text:"ズレてるくらいが"},
        {t:122.04, text:"ちょうどいい"},
        {t:125.68, text:"痛みごと"},
        {t:127.78, text:"音にして"},
        {t:130.22, text:"逃げないで"},
        {t:154.00, text:"檻はいらない"},
        {t:156.24, text:"理由もいらない"},
        {t:158.28, text:"この声は"},
        {t:160.41, text:"誰にも借りてない"},
        {t:162.94, text:"転んでもいい"},
        {t:164.75, text:"傷ついてもいい"},
        {t:167.03, text:"生き方だけは"},
        {t:170.45, text:"手放さない"}
    ];

    var cx = compW/2, cy = compH/2;

    for (var i=0; i<lyrics.length; i++) {
        var entry = lyrics[i];
        var lyr = mainComp.layers.addText(entry.text);
        lyr.name = "LYR_" + (i+1) + "_" + entry.text;
        var doc = lyr.property("Source Text").value;
        doc.font = "FuwaFude"; // fallback handled by AE if missing
        doc.fontSize = 110;
        doc.applyStroke = true; doc.strokeWidth = 8; doc.strokeColor = [0.9647,0.6588,0.8431];
        doc.applyFill = true; doc.fillColor = [1,1,1];
        doc.tracking = 50;
        lyr.property("Source Text").setValue(doc);

        var baseY = cy + ((i%3)-1)*80; // slight vertical drift between lines
        var basePos = [cx, baseY];
        var tIn = entry.t;
        var tPre = tIn - 0.25;
        var tSettle = tIn + 0.20;
        var tOut = (i < lyrics.length-1) ? (lyrics[i+1].t - 0.1) : (tIn + 2.5);

        var pos = lyr.property("Position");
        pos.setValueAtTime(tPre, [basePos[0], basePos[1]+220]);
        pos.setValueAtTime(tIn, basePos);
        pos.setValueAtTime(tSettle, [basePos[0], basePos[1]-12]);
        pos.setValueAtTime(tOut, [basePos[0], basePos[1]-12]);

        var opa = lyr.property("Opacity");
        opa.setValueAtTime(tPre, 0);
        opa.setValueAtTime(tIn, 100);
        opa.setValueAtTime(tOut, 100);

        var sc = lyr.property("Scale");
        sc.setValueAtTime(tIn, [120,120]);
        sc.setValueAtTime(tIn+0.2, [94,94]);

        // Alternate orientation: 0/90/-90 for variety
        var baseRot = (i % 3 === 0) ? 0 : ((i % 3 === 1) ? 90 : -90);
        var rotProp = lyr.property("Rotation");
        rotProp.setValue(baseRot);
        rotProp.expression = "wiggle(3,4)";

        // Slight blur on entry (simulating paint)
        var blur = lyr.property("Effects").addProperty("ADBE Gaussian Blur 2");
        blur.property("Blurriness").setValueAtTime(tPre, 30);
        blur.property("Blurriness").setValueAtTime(tIn+0.15, 0);

        // Keep layers ordered chronologically
        lyr.moveToBeginning();
    }

    // Helper: toggle neon image during chorus sections
    if (neonItem) {
        var neon = mainComp.layer("IMG_Neon");
        if (neon) {
            var onOff = neon.property("Opacity");
            var chorusTimes = [44.02, 46.36, 48.48, 50.12, 53.30, 55.27, 57.48, 60.67, 154.00, 156.24, 158.28, 160.41, 162.94, 164.75, 167.03, 170.45];
            for (var c=0; c<chorusTimes.length; c++) {
                var tt = chorusTimes[c];
                onOff.setValueAtTime(tt-0.2, 0);
                onOff.setValueAtTime(tt, 80);
                onOff.setValueAtTime(tt+3.0, 80);
                onOff.setValueAtTime(tt+3.2, 0);
            }
        }
    }

    // Title text precomp
    var titleComp = proj.items.addComp("TITLE_PRE", compW, compH, 1, 5, fps);
    var titleSolid = titleComp.layers.addSolid([0,0,0], "Title_BG", compW, compH, 1, 5);
    var title = titleComp.layers.addText("ふりーだむ");
    var tDoc = title.property("Source Text").value;
    tDoc.font = "FuwaFude";
    tDoc.fontSize = 160;
    tDoc.applyStroke = true; tDoc.strokeWidth = 10; tDoc.strokeColor = [0.9647,0.6588,0.8431];
    tDoc.applyFill = true; tDoc.fillColor = [1,1,1];
    title.property("Source Text").setValue(tDoc);
    title.property("Position").setValue([cx, cy]);
    title.property("Scale").setValueAtTime(0, [120,120]);
    title.property("Scale").setValueAtTime(0.2, [94,94]);
    title.property("Opacity").setValueAtTime(0, 0);
    title.property("Opacity").setValueAtTime(0.05, 100);
    title.property("Rotation").expression = "wiggle(2,3)";

    var blurT = title.property("Effects").addProperty("ADBE Gaussian Blur 2");
    blurT.property("Blurriness").setValueAtTime(0, 35);
    blurT.property("Blurriness").setValueAtTime(0.18, 0);

    // Add title comp to main and trim to 1.2s
    var titleLayer = mainComp.layers.add(titleComp);
    titleLayer.startTime = 0;
    titleLayer.outPoint = 1.2;

    app.endUndoGroup();

    alert("build_freedom.jsx: setup complete. Adjust fonts/orientation as needed.");
})();
