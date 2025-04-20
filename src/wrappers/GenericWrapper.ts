import * as Tone from "tone";

export abstract class GenericWrapper {
  id: string;
  isConnected: boolean;

  constructor(id: string, isConnected: boolean = false) {
    this.id = id;
    this.isConnected = isConnected;
  }

  abstract getNode(): Tone.ToneAudioNode;

  connect(wrapperNode: GenericWrapper): void {
    this.getNode().connect(wrapperNode.getNode());
  }

  connectToOutput(): void {
    this.getNode().toDestination();
  }

  disconnect(target?: Tone.ToneAudioNode): void {
    console.log("disconnecting node")
    if (target) {
      // disconnect only from target
      this.getNode().disconnect(target);
    } else {
      // disconnect from everything
      this.getNode().disconnect();
    }
  }
}
