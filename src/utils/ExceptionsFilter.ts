import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { AbstractHttpAdapter, HttpAdapterHost } from "@nestjs/core";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { MulterError } from "multer";

interface HttpErrorResponse {
    code: string;
    message: string;
    isSuccess: boolean;
    errors?: Array<any>;
}

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }
    handleHttpException(
        exception: HttpException,
        httpAdapter: AbstractHttpAdapter,
        ctx: HttpArgumentsHost,
        isProduction
    ) {
        const statusCode = exception.getStatus();
        const res = exception.getResponse() as HttpErrorResponse;
        return httpAdapter.reply(
            ctx.getResponse(),
            {
                message: res.message,
                code: (res.code),
                isSuccess: false,
                errors: (res.errors || null),
            },
            statusCode
        );
    }
    handleMulterException(
        exception: MulterError,
        httpAdapter: AbstractHttpAdapter,
        ctx: HttpArgumentsHost,
        isProduction
    ) {
        return httpAdapter.reply(
            ctx.getResponse(),
            {
                code: exception.code,
                message: isProduction ? exception.message : exception.code,
                isSuccess: false,
                statusCode: HttpStatus.BAD_REQUEST,
            },
            HttpStatus.BAD_REQUEST
        );
    }
    catch(exception: unknown, host: ArgumentsHost) {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const isProduction = process.env.NODE_ENV === "production";
        if (exception instanceof HttpException) {
            return this.handleHttpException(
                exception,
                httpAdapter,
                ctx,
                isProduction
            );
        }
        if (exception instanceof MulterError) {
            return this.handleMulterException(
                exception,
                httpAdapter,
                ctx,
                isProduction
            );
        }

        if (exception instanceof PrismaClientKnownRequestError) {
            if (exception.code == 'P2002') {
                return httpAdapter.reply(
                    ctx.getResponse(),
                    {
                        message: 'Record Already Exists',
                        stack: (exception as Error).stack,
                        isSuccess: false,
                        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }

        if (exception instanceof PrismaClientValidationError) {
            console.log("Error", exception)
                return httpAdapter.reply(
                    ctx.getResponse(),
                    {
                        message: exception.message,
                        stack: exception.clientVersion,
                        isSuccess: false,
                        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            
        }

        // otherwise
        return httpAdapter.reply(
            ctx.getResponse(),
            {
                message: (exception as Error).message,
                stack: (exception as Error).stack,
                isSuccess: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            },
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}