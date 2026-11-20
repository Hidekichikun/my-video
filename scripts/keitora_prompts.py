# 「軽トラのおじさん」MV 素材プロンプトを書き出す
# 使い方: my-video で  python3 scripts/keitora_prompts.py
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "mv", "軽トラのおじさん")
TITLE = "「軽トラのおじさん」"
HEAD = f"Use case: stylized-concept. Asset: {{asset}} for the Japanese comedy punk rock music video {TITLE}."
STYLE = ("16-bit pixel art, SNES-era 1990s Japanese racing game event-scene style, strictly 2D, flat shading with only 2-3 tones per color, "
         "limited color palette, crisp hard square pixel edges, coarse visible consistent pixel grid, no anti-aliasing, no gradients, "
         "no 3D rendering, no realistic lighting, dark outlines, no text, no letters, no numbers, no watermark")
GREEN = "Solid uniform flat bright green chroma-key background, no scenery, no floor, no cast shadow. No panel borders, no labels."

OJISAN = ("a fictional veteran Japanese factory worker in his late fifties with no official title who acts like a big boss: slightly chubby with a round potbelly, a very comical, strongly MONKEY-LIKE face (almost like a cartoon monkey: a heavy brow ridge over small round close-set eyes, a wide flat nose with big round nostrils, very big round ears sticking straight out to the sides, a long protruding upper lip and a pushed-out muzzle-like mouth area, deep smile creases), a small drip of clear runny snot always hanging from one nostril, "
          "tanned skin, short cropped dark hair with a little gray showing under the helmet, a WHITE safety helmet with a small round LED headlamp "
          "mounted on the front of it, light gray work jacket zipped up and stretched tight over his round belly, a pen in the chest pocket, "
          "dark gray work trousers, black safety shoes")
OJISAN_REF = ("Reference image role: characters/ojisan.png is the exact identity reference for the veteran worker "
              "(slightly chubby with a round potbelly, strongly monkey-like face with big ears and a pushed-out mouth, a drip of runny snot from one nostril, short cropped hair, white helmet with a small round headlamp on the front, light gray zipped work jacket). "
              "Preserve the face, outfit, body type, colors, proportions and pixel style exactly.")
TRUCK = ("a small white Japanese kei truck (tiny cab-over mini pickup with a low flat cargo bed and fold-down side gates), "
         "slightly dented, a little mud on the wheels, no logos, no license plate characters")
TRUCK_REF = ("Reference image role: characters/keitora.png is the exact reference for the white kei truck; "
             "characters/ojisan.png is the exact identity reference for the driver. Preserve shapes, colors and pixel style exactly.")
HERO_REF = ("Reference image role: ../社長ここは地球です/characters/hero.png is the exact identity reference for the protagonist "
            "(young woman factory worker, messy short black hair with an orange streak, yellow sticker-covered safety helmet, cheek bandage, "
            "navy work jacket). Preserve the face, outfit, body type, colors, proportions and pixel style exactly.")
COWORKER_REF = ("Reference image role: ../ウェルカムトゥザ社畜/characters/coworkers.png is the exact identity reference for the three coworkers. "
                "Preserve their faces, outfits, colors, proportions and pixel style exactly.")
KACHO_REF = ("Reference image role: ../課長ここは会社ですよ/characters/kacho.png is the exact identity reference for the section manager (kacho). "
             "Preserve the face, hair, body type, colors, proportions and pixel style exactly.")

def sprite(n, who, action, view="Front view.", ref=OJISAN_REF):
    return (HEAD.format(asset="animation sprite sheet") + " " + ref +
            f" Make EXACTLY {n} animation frames of {who} in ONE horizontal row, equal-width cells, evenly spaced, the same character at the same scale and baseline in every frame, full body visible, generous empty green gutters, no overlap, no cropping. Wide horizontal canvas. "
            f"Action: {action} {view} " + GREEN + " " + STYLE)

P = {}

# ---------- characters ----------
P["characters/ojisan"] = (HEAD.format(asset="one character reference illustration") +
    " It is the identity reference for all later sprites. Optional style reference: ../社長ここは地球です/characters/hero.png (match its pixel size and level of detail only; do NOT draw her). "
    f"Primary request: exactly ONE full-body standing character: {OJISAN}. Standing with arms crossed, chest pushed out, chin raised, "
    "a stern self-righteous frown, feet planted. Comedic and a little pompous, not evil, not scary. He must look clearly different from a company president in a suit and from a tall department manager: "
    "this is a slightly chubby, potbellied, monkey-faced veteran factory man with a runny nose. Slight three-quarter frontal view. The figure should feel like an approximately 90-pixel-tall native sprite enlarged with nearest-neighbor scaling "
    "(a bit shorter than a 96-pixel adult woman sprite), not a detailed modern illustration with a pixel filter. Square image, centered, comfortable margin, only one pose. "
    + GREEN + " " + STYLE)
P["characters/keitora"] = (HEAD.format(asset="one vehicle reference sheet") +
    f" Primary request: {TRUCK}. Show exactly TWO views side by side in one row with a wide green gap between them: left = clean side view facing right; right = rear view seen from directly behind "
    "(tailgate, two small square tail lights, rear window of the cab). Nobody in the truck. The side view should feel like an approximately 128-pixel-wide native sprite enlarged with nearest-neighbor scaling. "
    "Wide horizontal canvas. " + GREEN + " " + STYLE)
P["characters/race_icons"] = (HEAD.format(asset="UI icon sheet") +
    " Make EXACTLY 8 separate small icons arranged in a 4 x 2 grid with wide green gaps, each icon like an approximately 24-pixel native sprite enlarged with nearest-neighbor scaling: "
    "1 black-and-white checkered racing flag, 2 red fuel can, 3 golden king's crown, 4 yellow banana, 5 orange traffic cone, 6 black whiteboard marker, 7 green office swivel chair, 8 white baseball with red stitches. "
    "Square image. " + GREEN + " " + STYLE)

# ---------- sprites: おじさん O ----------
O = "the veteran worker"
P["sprites/O01_idle_armcross"] = sprite(2, O, "proud idle: frame 1 arms crossed, chest and belly pushed out, chin up, stern frown; frame 2 the same with his chest rising as he breathes in, nose a little higher.")
P["sprites/O02_lecture_finger"] = sprite(2, O, "lecturing: frame 1 raising his right index finger, mouth open mid-sentence, eyes closed smugly; frame 2 wagging the finger to the other side, mouth wide open.")
P["sprites/O03_palm_no"] = sprite(2, O, "flat refusal: frame 1 thrusting his right palm straight forward like a stop sign, stern face; frame 2 the same palm, his face turned away with eyes shut and nose up, completely not listening.")
P["sprites/O04_glare_lines"] = sprite(2, O, "displeasure: frame 1 standing with fists on hips, glaring, three deep vertical wrinkles between his eyebrows; frame 2 leaning forward, the glare harder, face a little redder.")
P["sprites/O05_monkey_grin"] = sprite(3, O, "the signature grin: frame 1 neutral face; frame 2 a huge comical monkey-like toothy grin with squinted eyes and raised cheeks, shoulders up; frame 3 the same grin while the small headlamp on his helmet blazes bright white-yellow with a few short blocky pixel light rays.")
P["sprites/O06_bow_yes"] = sprite(2, O, "outside-company politeness: frame 1 bowing deeply at the waist with an ingratiating smile, hands rubbing together; frame 2 coming up, still rubbing his hands, smile even wider.")
P["sprites/O07_angry_point"] = sprite(2, O, "angry scolding: frame 1 pointing forward with his whole arm, mouth wide open shouting, face red; frame 2 stamping one foot, pointing harder, a puff of steam above his helmet.")
P["sprites/O08_chair_check"] = sprite(3, O, "claiming someone else's chair: a green office swivel chair is in every frame. Frame 1 he is sitting on it, leaning over to pull the height lever; frame 2 leaning back hard to test the backrest, arms spread; frame 3 sitting comfortably and stroking the armrest with a sly satisfied grin.", view="Three-quarter view.")
P["sprites/O09_whiteboard"] = sprite(2, O, "communicating only by whiteboard: he holds up a small portable whiteboard covered in meaningless scribble lines (abstract squiggles only, no letters, no numbers). Frame 1 holding it up with a serious face; frame 2 tapping it hard with a black marker.")
P["sprites/O10_doya"] = sprite(2, O, "smug triumph: frame 1 thumb pointing at his own chest, chest out, extremely smug face with half-closed eyes; frame 2 the same pose while the headlamp on his helmet blazes bright with short blocky pixel light rays.")
P["sprites/O11_scold_down"] = sprite(2, O, "nitpicking a young worker: frame 1 leaning forward and pointing down at something on the floor in front of him, frowning; frame 2 shaking his head with eyes shut and one hand raised dismissively.")
P["sprites/O12_spine_straight"] = sprite(2, O, "alarm sensor: frame 1 slouching lazily with hands in pockets; frame 2 suddenly snapped to ramrod-straight attention, arms pinned to his sides, eyes wide, a big sweat drop.")
P["sprites/O13_old_days"] = sprite(2, O, "boasting about the old days: frame 1 gazing far into the distance with one hand on his chin, nostalgic proud face; frame 2 arm sweeping out wide toward the horizon, eyes closed, deeply moved by himself.")
P["sprites/O14_swing_miss"] = sprite(3, O, "strikeout: frame 1 holding a wooden baseball bat in a confident batting stance; frame 2 a huge full swing, eyes shut; frame 3 spun completely around and off balance, the bat behind him, still with a smug face.", view="Side view facing right.")
P["sprites/O15_toneup_greet"] = sprite(2, O, "sucking up to a superior: frame 1 springing up onto his tiptoes, arms straight at his sides, an overly bright ingratiating smile; frame 2 a quick deep bow, still smiling, sparkles near his face.")
P["sprites/O16_gossip"] = sprite(2, O, "loose lips: frame 1 leaning sideways with one hand cupped beside his mouth, whispering gossip with a sneaky face; frame 2 the same pose, eyes darting the other way.", view="Side view facing right.")
P["sprites/O17_head_tilt"] = sprite(2, O, "condescending head tilt (his neck stays attached and natural, only the head leans): frame 1 arms crossed, standing straight, neutral stern face; frame 2 the same arms-crossed pose with his whole head tilted about 45 degrees to his right, the neck bending naturally and the shoulders slightly following, half-closed eyes looking down on the viewer with a smug, doubtful frown. Same body position and same feet in both frames.")

# ---------- sprites: 軽トラ V ----------
P["sprites/V01_truck_rear_drive"] = sprite(3, "the white kei truck driven by the veteran worker", "racing seen from directly behind like a 1990s SNES Mode 7 racing game: the back of his white helmet visible through the rear cab window. Frame 1 driving straight; frame 2 the truck bounced up slightly with a small gray exhaust puff; frame 3 leaning into a turn to the left.", view="Rear view.", ref=TRUCK_REF)
P["sprites/V02_truck_side_drive"] = sprite(2, "the white kei truck driven by the veteran worker", "driving fast to the right: his head with the white helmet visible in the side window, a few speed lines and small dust clouds behind the wheels; frame 2 the wheels in a different rotation position and the body bounced up a little.", view="Side view facing right.", ref=TRUCK_REF)
P["sprites/V03_truck_arrive"] = sprite(3, "the white kei truck and the veteran worker", "grand arrival: frame 1 the truck parked, driver door closed, he is inside; frame 2 the door swung open and he is stepping out with one foot on the ground; frame 3 the door open and he stands beside the truck with arms crossed and chin up.", view="Side view facing right.", ref=TRUCK_REF)
P["sprites/V04_mirror_closeup"] = sprite(2, "the side mirror of the white kei truck", "close-up: one big rectangular side door mirror on its arm; in the mirror is the reflection of the veteran worker's face admiring himself. Frame 1 a self-satisfied face; frame 2 a huge monkey-like grin with the helmet headlamp blazing inside the reflection.", view="Close-up, slight three-quarter view.", ref=TRUCK_REF)
P["sprites/V05_truck_throne"] = sprite(2, "the veteran worker on his kei truck throne", "a green office swivel chair stands on the flat cargo bed of the parked white kei truck like a royal throne, and he sits on it with arms crossed and legs spread, smug king face; frame 2 the same, the headlamp on his helmet blazing with short blocky pixel light rays.", view="Side three-quarter view.", ref=TRUCK_REF)

# ---------- sprites: 主人公 H / 同僚 M / 課長 K ----------
P["sprites/H08_umpire_call"] = sprite(2, "the protagonist", "umpire strike call: frame 1 standing still, totally deadpan, dead eyes; frame 2 punching her right fist sideways and up like a baseball umpire calling a strike, still completely deadpan.", ref=HERO_REF)
P["sprites/H09_head_tilt"] = sprite(2, "the protagonist", "silent doubt: frame 1 deadpan; frame 2 head tilted a full 45 degrees to one side, deadpan dead eyes, arms hanging.", ref=HERO_REF)
P["sprites/M06_flatter_clap"] = sprite(2, "the three coworkers standing side by side as one group", "flattering the boss: frame 1 all three clapping with stiff fake smiles; frame 2 all three bowing slightly while clapping, eyes dead behind the smiles.", ref=COWORKER_REF)
P["sprites/M07_ukki_cheer"] = sprite(2, "the three coworkers standing side by side as one group", "gang shout: frame 1 all three crouched with fists down, mouths shut; frame 2 all three jumping with fists raised high, mouths wide open shouting.", ref=COWORKER_REF)
P["sprites/K16_hospital_bed"] = sprite(2, "the section manager (kacho) lying in a simple white hospital bed", "in light blue hospital pajamas with one leg in a white cast raised on a sling. Frame 1 lying back, staring at the ceiling, worried; frame 2 propped up, anxiously staring at a small flip phone in his hand.", view="Side three-quarter view.", ref=KACHO_REF)

# ---------- backgrounds ----------
def bg(scene, comp="Flat side-on 2D composition like a 1990s SNES game event scene, empty foreground floor area left clear for later character sprites."):
    return ("Use case: stylized-concept. Asset: one music-video background, wide landscape, exact 16:9 aspect ratio. "
            "Reference image role: ../部長ここは地上です/backgrounds/B2_factory_floor.png is ONLY a reference for coarse pixel size and detail level; do not copy its content. "
            f"Scene: {scene} {comp} Full-bleed single scene, no frame or border. No people, no characters, no vehicles, no logos, no readable signs. " + STYLE)
MODE7 = "Classic SNES Mode 7 pseudo-3D racing perspective seen from behind and slightly above the road, horizon at about 40 percent of the height, the road center lower half left empty for a vehicle sprite."
P["backgrounds/B1_parking_morning"] = bg("The employee parking lot of a Japanese paper factory early in the morning: white parking lines on asphalt, a chain-link fence, factory buildings with chimneys and white steam behind, pale morning sky.")
P["backgrounds/B2_race_road"] = bg("A straight asphalt road running through the grounds of a Japanese paper factory, red-and-white rumble strips on both edges, stacks of giant paper rolls, pipes, tanks and factory buildings lining both sides, morning blue sky.", comp=MODE7)
P["backgrounds/B3_genba_office"] = bg("A small cramped on-site supervisors' office in a factory: gray steel desks, a big blank whiteboard on the wall, clipboards, safety helmets on a shelf, a fluorescent light, a window looking onto the factory floor.")
P["backgrounds/B4_throne_room"] = bg("A grand castle throne room from a 1990s fantasy game but oddly mixed with a factory: a long red carpet leading to an empty golden throne on a dais, stone pillars, banners with only plain shapes, a few steel pipes and a fire extinguisher on the stone walls.")
P["backgrounds/B5_other_company"] = bg("A spotless modern reception room at another company: white walls, a gray sofa set and low table, a potted plant, a big window with city buildings, very polite and quiet atmosphere.")
P["backgrounds/B6_warehouse_back"] = bg("The dusty dim back corner of a factory warehouse: tall steel shelves with cardboard boxes, cobwebs, a single hanging lamp, and in the middle a strange old machine half covered by a gray dust sheet.")
P["backgrounds/B7_pit_lane"] = bg("A factory yard set up like a racing pit lane: an old fuel pump, stacked tires, traffic cones, a tool cart, an open garage shutter, morning light.")
P["backgrounds/B8_old_factory"] = bg("A Japanese factory interior from the early 1980s Showa era: old heavy machines, belt drives, wooden crates, dim yellow lights, steam. (It will be tinted sepia later in editing.)")
P["backgrounds/B9_hospital_room"] = bg("A plain Japanese hospital room: pale green walls, a window with a curtain, a curtain rail on the ceiling, a small bedside cabinet with a vase of flowers, the center floor space left empty for a bed sprite.")
P["backgrounds/B10_sunset_road"] = bg("The same kind of straight road through a factory at sunset: orange and purple sky, long shadows, silhouettes of chimneys, the road completely empty all the way to the horizon, lonely mood.", comp=MODE7)

# ---------- thumbnail / jacket (illustration) ----------
HERO_ILL = ("the protagonist: a young Japanese woman factory worker in her twenties, messy short black hair with a vivid orange streak, a beat-up yellow safety helmet covered with faded punk band stickers "
            "(graphic symbols only, no legible letters), a large bandage on one cheek, safety-pin earrings, chain choker, navy blue work jacket with rolled-up sleeves, deadpan tired face with alert dark eyes")
OJI_ILL = ("a fictional veteran Japanese factory worker in his late fifties with no official title who acts like a big boss: slightly chubby with a round potbelly, a very comical, strongly MONKEY-LIKE face (almost like a cartoon monkey: a heavy brow ridge over small round close-set eyes, a wide flat nose with big round nostrils, very big round ears sticking straight out to the sides, a long protruding upper lip and a pushed-out muzzle-like mouth area, deep smile creases), a small drip of clear runny snot always hanging from one nostril, tanned skin, short cropped dark hair with a little gray, "
           "a white safety helmet with a small round headlamp on the front, light gray zipped work jacket")
ILL_STYLE = ("Style: high-detail semi-realistic Japanese anime illustration, confident ink line art with loose expressive strokes, watercolor and gouache painting with subtle paper texture, "
             "muted desaturated palette with accents of safety yellow and orange, slightly grungy punk zine feeling, soft natural light, sharp eyes with strong catchlights. Same look as the reference thumbnails. "
             "No text, no letters, no numbers, no logos, no watermark, no speech bubbles.")
ILL_REF = ("Reference images: ../課長ここは会社ですよ/サムネ_課長ここは会社です_イラスト版.png and ../社長ここは地球です/サムネ案_イラスト×ゲームUI.png "
           "(crop out the UI windows mentally; use them ONLY for the protagonist's identity and the painting style). Also characters/ojisan.png and characters/keitora.png for the new character and the truck design.")
THUMB_COMP = ("Composition: exact 16:9. Keep the bottom 30 percent simple (it will be covered by a game message window with the title), keep the top-left and top-right corners empty for game UI, main eyes about 35 percent from the top.")
P["thumbnail/T1_thumb_hero"] = ("YouTube thumbnail base illustration. " + ILL_REF +
    f" Subject: in the right foreground, {HERO_ILL}, making a baseball umpire's strike call with her right fist punched sideways, completely deadpan, looking at the viewer. "
    f"Behind her on the left, a small white Japanese kei truck on a factory road, and leaning out of its driver's window, {OJI_ILL}, with a huge comical monkey-like toothy grin, the headlamp on his helmet blazing with a lens flare. "
    "Factory chimneys and morning sky behind. " + THUMB_COMP + " " + ILL_STYLE)
P["thumbnail/T2_thumb_ojisan"] = ("YouTube thumbnail base illustration. " + ILL_REF +
    f" Subject: {OJI_ILL}, sitting like a king on a green office swivel chair placed on the flat cargo bed of a small white Japanese kei truck, arms crossed, legs spread, a smug self-righteous face, "
    "the headlamp on his helmet blazing with a lens flare like a crown jewel. Around the truck, three factory coworkers clapping with stiff fake smiles. "
    f"In the lower left, small, {HERO_ILL}, staring at the viewer with dead eyes. " + THUMB_COMP + " " + ILL_STYLE)
P["thumbnail/J1_jacket_square"] = ("Album cover artwork base illustration, exact 1:1 square, as large as possible (it will be upscaled to 3000x3000). " + ILL_REF +
    f" Subject: a close-up of the big side door mirror of a small white Japanese kei truck filling the upper-center of the image; in the mirror is the reflection of {OJI_ILL}, admiring himself with a smug grin, "
    "the headlamp on his helmet blazing with a soft lens flare inside the reflection. Outside the mirror, an empty factory road at dusk stretching to the horizon, nobody there. "
    "Composition: the face in the mirror in the upper-middle area (eyes about 30 to 40 percent from the top), keep the bottom 30 percent darker and simpler for the title and artist name to be added later. " + ILL_STYLE)

ORDER = ["characters", "sprites", "backgrounds", "thumbnail"]
for k, v in P.items():
    path = os.path.join(ROOT, k + "-prompt.txt")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(v + "\n")
for d in ["voice", "se"]:
    os.makedirs(os.path.join(ROOT, d), exist_ok=True)

with open(os.path.join(ROOT, "プロンプト集.md"), "w", encoding="utf-8") as f:
    f.write(f"# {TITLE} MV 素材プロンプト集（{len(P)}枚）\n\n各フォルダの `〇〇-prompt.txt` と同じ内容。保存名は `-prompt.txt` を取って `.png`。\n")
    for folder in ORDER:
        f.write(f"\n## {folder}\n")
        for k, v in P.items():
            if k.startswith(folder + "/"):
                f.write(f"\n### {k}.png\n\n```\n{v}\n```\n")
print(len(P), "prompts written to", ROOT)
