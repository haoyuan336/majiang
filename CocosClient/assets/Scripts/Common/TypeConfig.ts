enum EventType {
    Invalide,
    ShowLoading,
    HideLoading
}
interface MsgInterface {
    eventType: string,
    data: object,
    callback: Function
}
export { EventType , MsgInterface};