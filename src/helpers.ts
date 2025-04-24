export function generateNodeId(type: string) {
    return type + '_' + crypto.randomUUID()
}