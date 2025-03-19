import * as Tone from 'tone';

export abstract class MegaNode {
    id: string;
    isConnected: boolean;
    
    constructor(id: string, isConnected: boolean = false) {
        this.id = id;
        this.isConnected = isConnected
    }

    abstract getNode(): Tone.ToneAudioNode;

    connect(megaNode: MegaNode): void {
        this.getNode().connect(megaNode.getNode());
    }
}