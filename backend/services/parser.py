from music21 import converter, instrument, note, chord

def parse_music_file(filename, content):
    score = converter.parse(content)
    notes = []
    instruments = set()

    for part in score.parts:
        instr = part.getInstrument(returnDefault=True)
        instruments.add(instr.instrumentName)

        for element in part.recurse():
            if isinstance(element, note.Note):
                notes.append({
                    "pitch": element.pitch.nameWithOctave,
                    "start": element.offset,
                    "duration": element.quarterLength,
                    "instrument": instr.instrumentName
                })
            elif isinstance(element, chord.Chord):
                for n in element.notes:
                    notes.append({
                        "pitch": n.nameWithOctave,
                        "start": element.offset,
                        "duration": element.quarterLength,
                        "instrument": instr.instrumentName
                    })

    return {
        "notes": notes,
        "instruments": list(instruments),
        "metadata": {
            "title": score.metadata.title if score.metadata else "Sin título",
            "tempo": score.metronomeMarkBoundaries()[0][2].number if score.metronomeMarkBoundaries() else 120,
            "time_signature": str(score.recurse().getElementsByClass('TimeSignature')[0])
        },
        "score": score
    }