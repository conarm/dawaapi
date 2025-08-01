import { writable, type Writable } from "svelte/store";
import * as Tone from "tone";
import { GenericWrapper } from "./GenericWrapper";

export class WrapperReverb extends GenericWrapper {
  roomSize: Writable<number>;
  wet: Writable<number>;
  private reverbObject: Tone.JCReverb;
  type: string = "reverb";

  constructor(id: string, initRoomSize: number, initWet: number) {
    super(id);

    // Set up Tone params
    this.roomSize = writable(initRoomSize);
    this.wet = writable(initWet);

    // Initialise custom Tone object
    this.reverbObject = new Tone.JCReverb(0.5);

    this.roomSize.subscribe((val) => {
      this.change_room_size(val);
    });

    this.wet.subscribe((val) => {
      this.change_wet(val);
    });

    this.id = id;
  }

  getNode(): Tone.JCReverb {
    return this.reverbObject;
  }

  change_room_size(roomSize: number): void {
    this.reverbObject.set({ roomSize: roomSize });
  }

  change_wet(wet: number): void {
    this.reverbObject.set({ wet: wet });
  }
}
