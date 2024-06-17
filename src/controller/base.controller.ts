export class BaseController {
    public Success<T>(data: T, message?: string) {
        return {
            isSuccess: true,
            message: message,
            data: data
        }
    }
}