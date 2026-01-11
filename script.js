// Noten-Mapping für Enharmonik
const noteMap = {
    'C': 'C',
    'C#': 'C#',
    'Db': 'C#',
    'D': 'D',
    'D#': 'D#',
    'Eb': 'D#',
    'E': 'E',
    'F': 'F',
    'F#': 'F#',
    'Gb': 'F#',
    'G': 'G',
    'G#': 'G#',
    'Ab': 'G#',
    'A': 'A',
    'A#': 'A#',
    'Bb': 'A#',
    'B': 'B',
    'Cb': 'B' // Cb ist enharmonisch B
};

// Dur-Skala Intervallmuster (Ganzton, Ganzton, Halbton, Ganzton, Ganzton, Ganzton, Halbton)
const majorScaleIntervals = [2, 2, 1, 2, 2, 2, 1]; // in Halbtönen

// Alle Noten in chromatischer Reihenfolge
const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Mapping für b-Tonarten
const flatNoteDisplay = {
    'C#': 'Db',
    'D#': 'Eb',
    'F#': 'Gb',
    'G#': 'Ab',
    'A#': 'Bb'
};

// Funktion zum Erstellen einer Dur-Skala aus einer Grundtonart
function getMajorScale(rootNote) {
    const normalizedRoot = noteMap[rootNote] || rootNote;
    const rootIndex = chromaticNotes.indexOf(normalizedRoot);
    
    if (rootIndex === -1) {
        console.error(`Ungültige Tonart: ${rootNote}`);
        return [];
    }
    
    const scale = [normalizedRoot];
    let currentIndex = rootIndex;
    
    for (let i = 0; i < majorScaleIntervals.length - 1; i++) {
        currentIndex = (currentIndex + majorScaleIntervals[i]) % chromaticNotes.length;
        scale.push(chromaticNotes[currentIndex]);
    }
    
    return scale;
}

// Funktion zum Normalisieren von Notennamen (für Vergleich)
function normalizeNote(note) {
    return noteMap[note] || note;
}

// Funktion zum Highlighten der Noten auf dem Griffbrett
function highlightNotes(selectedKey, rootNoteOverride = null) {
    // Alle Highlights entfernen
    document.querySelectorAll('.fret-marker').forEach(marker => {
        marker.classList.remove('highlighted', 'root-note');
        // Reset display text to original data-note
        marker.style.setProperty('--display-note', `"${marker.getAttribute('data-note')}"`);
    });
    
    // Prüfen ob die Tonart b-Vorzeichen nutzt
    const useFlats = selectedKey.includes('b') || selectedKey === 'F';
    
    // Skala für die gewählte Tonart erstellen
    const scale = getMajorScale(selectedKey);
    const normalizedScale = scale.map(normalizeNote);
    
    // Der Grundton, der hervorgehoben werden soll
    const rootNote = normalizeNote(rootNoteOverride || selectedKey);
    
    // Alle Fret-Marker durchgehen und passende Noten highlighten
    document.querySelectorAll('.fret-marker').forEach(marker => {
        const note = marker.getAttribute('data-note');
        const normalizedNote = normalizeNote(note);
        
        if (normalizedScale.includes(normalizedNote)) {
            marker.classList.add('highlighted');
            
            // Dynamische Beschriftung anpassen
            if (useFlats && flatNoteDisplay[normalizedNote]) {
                marker.style.setProperty('--display-note', `"${flatNoteDisplay[normalizedNote]}"`);
            } else {
                marker.style.setProperty('--display-note', `"${normalizedNote}"`);
            }
            
            // Grundton besonders hervorheben
            if (normalizedNote === rootNote) {
                marker.classList.add('root-note');
            }
        }
    });
}

// Event Listener für Quintenzirkel-Buttons
document.addEventListener('DOMContentLoaded', () => {
    const keyButtons = document.querySelectorAll('.key-btn');
    
    keyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Aktiven Zustand aktualisieren
            keyButtons.forEach(btn => btn.classList.remove('active', 'minor-active'));
            
            if (e.target.classList.contains('minor-label')) {
                button.classList.add('minor-active');
                const majorKey = button.getAttribute('data-key');
                const minorKey = button.getAttribute('data-minor');
                // Bei Moll: Töne der Dur-Parallele, aber Moll-Grundton
                highlightNotes(majorKey, minorKey);
            } else {
                button.classList.add('active');
                const majorKey = button.getAttribute('data-key');
                highlightNotes(majorKey);
            }
        });
    });
    
    // Standardmäßig C-Dur auswählen
    const defaultButton = document.querySelector('.key-btn[data-key="C"]');
    if (defaultButton) {
        defaultButton.click();
    }
});
