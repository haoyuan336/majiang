enum EventType {
    Invalide,
    ShowLoading,
    HideLoading
}
interface MsgInterface {
    eventType: string,
    data: string,
    callback: Function
}
export { EventType , MsgInterface};