export class BaseResponse {
    reqId: string;
    isSuccess: boolean
    data?: any;
    message?: string;
    statusCode?: number | 0;
}