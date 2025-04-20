import { get, writable, type Writable } from "svelte/store";
import * as Tone from "tone";
import { patterns, pitches, shapes } from "../consts";
import { GenericWrapper } from "./GenericWrapper";

export class WrapperSynth extends GenericWrapper {
  // TODO: Rename these to actual slider types
  volume: Writable<number>;
  pitch: Writable<number>;
  shape: Writable<number>;
  private synthObject: Tone.Synth;
  pattern: string;
  part: Tone.Part;
  type: string = "synth";

  constructor(
    id: string,
    initVolume: number,
    initPitch: number,
    initShape: number,
    pattern: string,
    isConnected: boolean,
  ) {
    super(id, isConnected);

    this.synthObject = new Tone.Synth();

    this.volume = writable(initVolume);
    this.pitch = writable(initPitch);
    this.shape = writable(initShape);

    this.volume.subscribe((val) => {
      this.change_volume(val);
    });

    this.pitch.subscribe((val) => {
      this.change_pitch(val);
    });
    this.shape.subscribe((val) => {
      this.change_shape(val);
    });

    // TODO: don't hardcode pattern through constructor - allow for pattern to be set by a dropdown or an input node
    this.pattern = pattern;
    // Set melody
    this.part = new Tone.Part(
      (time, event) => {
        this.synthObject.triggerAttackRelease(event.note, event.dur, time);
      },
      patterns[pattern]
    );
  }

  getNode(): Tone.Synth {
    return this.synthObject;
  }

  connect(wrapperNode: GenericWrapper): void {
    super.connect(wrapperNode);
    this.enable();
  }

  enable(): void {
    this.isConnected = true;
    if (this.pattern != '') {
      // enabled with pattern
      console.log("enabling pattern!")
      this.part.stop()
      this.part = new Tone.Part(
        (time, event) => {
          this.synthObject.triggerAttackRelease(event.note, event.dur, time);
        },
        patterns[this.pattern]
      )
      this.part.loop = true;
      this.part.loopEnd = "1m"
      this.part.start();
    } else {
      this.synthObject.triggerAttack(pitches[get(this.pitch)]); // Start a constant note
    }
    Tone.getTransport().start();
  }

  disable(): void {
    this.isConnected = false;
    this.synthObject.triggerRelease(); // Stop the note
    this.synthObject.disconnect;
    this.part.stop()
  }

  change_volume(volume: number): void {
    this.synthObject.set({
      volume: volume,
    });
  }

  change_pitch(pitch: number): void {
    this.synthObject.setNote(pitches[pitch]);
  }

  change_shape(shape: number): void {
    this.synthObject.oscillator.type = shapes[shape];
  }
}
