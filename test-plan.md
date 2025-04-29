# Manual Testing Plan

At developments increments, such as new features, proceed through and update the following manual tests.

**Last updated 28/04/25**

## 1. UI and Usability

| Test Case | Steps | Expected Result |
|:---|:---|:---|
| UI Layout | Open the application | Canvas, menu, help button should be visible |
| Help Button | Click the help button | A clear and complete usage guide should appear, with correct spacing and margins |
| Responsiveness | Resize the browser window | The layout should adjust appropriately |

## 2. Nodes

| Test Case | Steps | Expected Result |
|:---|:---|:---|
| Add Synth Node | Use menu to add a Synth node | Synth node appears on the canvas |
| Add Effect Node | Use menu to add a Reverb node | Reverb node appears on the canvas |
| Add Pattern Node | Use menu to add a Pattern node | Pattern node appears on the canvas |
| Delete Node | Select a node and delete it (if supported) | Node is removed from the canvas |
| Node Info Buttons | Add nodes and click information buttons | Specific information about the node should be displayed correctly |

## 3. Connections Between Nodes

| Test Case | Steps | Expected Result |
|:---|:---|:---|
| Connect Pattern to Synth | Drag from a Pattern's output to a Synth's input | Connection is established |
| Connect Synth to Effect | Drag from the Synth's output to a Reverb's input | Connection is established |
| Connect Effect to Audio Output | Drag from the Reverb's output to the Audio Output input | Audio path completed |
| Disconnect Nodes | Delete one of the connections | Connection disappears |
| Invalid Connection Attempt 1 | Try connecting two an output to an output together | Should not allow the connection |
| Invalid Connection Attempt 2 | Try connecting a Reverb's audio output to a Synth's control input | Should not allow the connection |

## 4. Signal Behavior

| Test Case | Steps | Expected Result |
|:---|:---|:---|
| Play Synth Alone | Connect a Synth directly to the Audio Output and listen | A constant note plays |
| Play Synth with Pattern | Connect a Pattern to a Synth, and the Synth to the Audio Output | Synth plays the predefined note pattern |
| Add Reverb Effect | Connect the Pattern to the Synth, the Synth to a Reverb, and the Reverb to the Audio Output | Same pattern heard, but with reverb effect |
| Add Delay Effect | Connect the Pattern to the Synth, the Synth to a Delay, and the Reverb to the Audio Output | Same pattern heard, but with delay effect |
| Add Phaser Effect | Connect the Pattern to the Synth, the Synth to a Phaser, and the Reverb to the Audio Output | Same pattern heard, but with phaser effect |