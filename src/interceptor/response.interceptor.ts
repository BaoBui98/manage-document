import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    data: T;
    statusCode: number;
    message: string | string[];
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<Response<T>> {
        return next.handle().pipe(
            map((data) => {
                const response = context.switchToHttp().getResponse();
                const statusCode = response.statusCode;

                // Nếu trong controller trả về object có chứa message thì lấy message đó
                // Ví dụ: return { message: 'Tạo thành công', data: user }
                if (data && typeof data === 'object' && ('message' in data || 'data' in data)) {
                    return {
                        data: data.data !== undefined ? data.data : null,
                        statusCode,
                        message: data.message || 'Thành công',
                    };
                }

                return {
                    data: data !== undefined ? data : null,
                    statusCode,
                    message: 'Thành công',
                };
            }),
        );
    }
}
