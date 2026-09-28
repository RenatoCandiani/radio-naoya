"""Versão D: a torre com traço GROSSO, pra sobreviver aos 32px do Gmail.
Na versão anterior o mastro era fino e as travessas viravam sujeira quando
reduzia. Aqui: mastro largo, sem travessas, e só 2 ondas bem grossas.
E versão E: RN com uma onda em cima, juntando legibilidade e tema.
"""
import os
from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
SS, LADO = 4, 512
AZUL, AZUL_ESCURO, BRANCO = (0x15, 0x65, 0xC0), (0x0D, 0x47, 0xA1), (255, 255, 255)


def fonte(tam):
    for n in ['seguibl.ttf', 'ariblk.ttf', 'arialbd.ttf']:
        try:
            return ImageFont.truetype(rf'C:\Windows\Fonts\{n}', tam)
        except OSError:
            continue
    return ImageFont.load_default()


def base():
    img = Image.new('RGBA', (LADO * SS, LADO * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    L = LADO * SS
    for y in range(L):
        t = y / L
        d.line([(0, y), (L, y)], fill=tuple(round(AZUL[i] + (AZUL_ESCURO[i] - AZUL[i]) * t) for i in range(3)) + (255,))
    return img, d


def circulo(img):
    L = img.size[0]
    m = Image.new('L', (L, L), 0)
    ImageDraw.Draw(m).ellipse((0, 0, L - 1, L - 1), fill=255)
    fora = Image.new('RGBA', (L, L), (0, 0, 0, 0))
    fora.paste(img, (0, 0), m)
    return fora


def salva(img, nome):
    circulo(img).resize((LADO, LADO), Image.LANCZOS).save(os.path.join(AQUI, nome))


# ---------- D: torre grossa ----------
imgD, d = base()
L = LADO * SS
cx, cy = L / 2, L * 0.50
e = SS
d.polygon([(cx - 30 * e, cy + 150 * e), (cx - 15 * e, cy - 30 * e),
           (cx + 15 * e, cy - 30 * e), (cx + 30 * e, cy + 150 * e)], fill=BRANCO + (255,))
d.ellipse((cx - 32 * e, cy - 92 * e, cx + 32 * e, cy - 28 * e), fill=BRANCO + (255,))
for i, r in enumerate([78, 128]):
    cx0, cy0 = cx, cy - 60 * e
    caixa = (cx0 - r * e, cy0 - r * e, cx0 + r * e, cy0 + r * e)
    larg = int((30 - i * 5) * e)
    d.arc(caixa, start=192, end=246, fill=BRANCO + (255,), width=larg)
    d.arc(caixa, start=294, end=348, fill=BRANCO + (255,), width=larg)
salva(imgD, 'avatar_d_torre_grossa.png')

# ---------- E: RN com onda em cima ----------
imgE, d = base()
f = fonte(int(205 * SS))
txt = 'RN'
bb = d.textbbox((0, 0), txt, font=f)
d.text(((L - (bb[2] - bb[0])) / 2 - bb[0], L * 0.60 - (bb[3] - bb[1]) / 2 - bb[1]),
       txt, font=f, fill=BRANCO + (255,))
cx0, cy0 = L / 2, L * 0.335
for i, r in enumerate([52, 92]):
    d.arc((cx0 - r * SS, cy0 - r * SS, cx0 + r * SS, cy0 + r * SS),
          start=200, end=340, fill=BRANCO + (255,), width=int((24 - i * 6) * SS))
d.ellipse((cx0 - 15 * SS, cy0 - 15 * SS, cx0 + 15 * SS, cy0 + 15 * SS), fill=BRANCO + (255,))
salva(imgE, 'avatar_e_rn_onda.png')

# ---------- folha de prova só com os finalistas ----------
op = [('B  RN', 'avatar_b_rn.png'), ('C  sinal', 'avatar_c_sinal.png'),
      ('D  torre grossa', 'avatar_d_torre_grossa.png'), ('E  RN + onda', 'avatar_e_rn_onda.png')]
TAM = [160, 96, 48, 32]
larg = 250 + sum(TAM) + 40 * len(TAM)
prova = Image.new('RGB', (larg, 190 * len(op) + 50), (245, 246, 248))
p = ImageDraw.Draw(prova)
p.text((20, 16), 'Finalistas — tamanhos reais do Gmail (160 / 96 / 48 / 32 px)', font=fonte(20), fill=(40, 40, 46))
for li, (nome, arq) in enumerate(op):
    y0 = 48 + li * 190
    im = Image.open(os.path.join(AQUI, arq))
    p.text((20, y0 + 74), nome, font=fonte(21), fill=(40, 40, 46))
    x = 250
    for t in TAM:
        mini = im.resize((t, t), Image.LANCZOS)
        prova.paste(mini, (x, y0 + (160 - t) // 2), mini)
        x += t + 40
prova.save(os.path.join(AQUI, 'prova_finalistas.png'))
print('ok')
