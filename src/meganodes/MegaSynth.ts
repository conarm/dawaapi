import { writable, type Writable } from 'svelte/store';
import * as Tone from 'tone';
import { pitches,
    shapes
 } from '../consts';
import { MegaNode } from './MegaNode';

export class MegaSynth extends MegaNode {
    // TODO: Rename these to actual slider types
    slider1: Writable<number>;
    slider2: Writable<number>;
    slider3: Writable<number>;
    pitch: number;
    synth: Tone.Synth;
    pattern: string;
    part: Tone.Part;

    constructor(initVol: number, initPitch: number, initX: number, id: string, pattern: string, isConnected: boolean) {
        super(id, isConnected);

        this.pitch = initPitch;
        this.synth = new Tone.Synth();

        this.slider1 = writable(initVol);
        this.slider2 = writable(initPitch);
        this.slider3 = writable(initX);

        this.slider1.subscribe((val) => {
            this.change_synth_volume(val);
        })

        this.slider2.subscribe((val) => {
            this.change_synth_pitch(val);
        })
        this.slider3.subscribe((val) => {
            this.change_synth_shape(val);
        })

        // TODO: don't hardcode pattern through constructor - allow for pattern to be set by a dropdown or an input node
        this.pattern = pattern;

        // set melody
        this.part = new Tone.Part((time, event) => 
            { this.synth.triggerAttackRelease(event.note, event.dur, time)},
            [{ time : 0, note : "C4", dur : "4n"}, { time : "4n + 8n", note : "E4", dur : "8n"}, { time : "2n", note : "G4", dur : "16n"}, { time : "2n + 8t", note : "B4", dur : "4n"}])    
    }

    getNode(): Tone.Synth {
        return this.synth;
    }

    connect(megaNode: MegaNode): void {
        super.connect(megaNode)
        this.enable();
    }

    enable() {
        console.log("Synth enabled - triggering attack");
        this.isConnected = true;
        if (this.pattern == 'pattern1') {
            this.part.loop = true;
            this.part.start();
        } else {
            this.synth.triggerAttack(pitches[this.pitch]); // Start a constant note
        }
        Tone.getTransport().start();
    }

    disable() {
        console.log("Synth disabled - triggering release");
        this.isConnected = false;
        this.synth.triggerRelease(); // Stop the note
        // TODO: keep this here?
        this.synth.disconnect;
    }

    change_synth_volume(val: number) {
        console.log("Volume changed");
        this.synth.set({
            volume: val
        })
    }
    
    change_synth_pitch(val: number) {
        console.log("Pitch changed");
        this.synth.setNote(pitches[val]);
        this.pitch = val;
    }
    
    change_synth_shape(val: number) {
        console.log("Pitch changed");
        this.synth.oscillator.type = shapes[val];
    }
}