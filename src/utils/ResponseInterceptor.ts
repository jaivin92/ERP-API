import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponse } from 'src/models/common/BaseResponse.model';


@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe<BaseResponse>(
            map(data => {
                Logger.log("ResponseInterceptor", `${data}`)
                const response = context.switchToHttp().getResponse()
                if (data.data.token) {
                    response.header("token", data.data.token)
                    data.data.token = undefined
                }

                return {
                    //  status: 'success', // or 'error' depending on the situation
                    statusCode: context.switchToHttp().getResponse().statusCode, // or 'error' depending on the situation
                    reqId: context.switchToHttp().getRequest().headers['reqid'],
                    isSuccess: data.isSuccess || false,
                    message: data.message || 'success', // or any other default message
                    data: data.data || data
                };
            }),
        );
    }
}