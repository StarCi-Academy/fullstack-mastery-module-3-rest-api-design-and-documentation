/**
 * Service xu ly logic nghiep vu cua Cat.
 * (EN: Business logic service for Cat.)
 */
import {
    BadRequestException, Injectable 
} from "@nestjs/common"
import {
    CreateCatDto 
} from "./dto/create-cat.dto"

/**
 * Bản ghi mèo demo trong memory (khớp response `GET /cats` trong giáo trình) (EN: in-memory cat record matching lesson `GET /cats` sample).
 */
export interface CatRecord {
    name: string
    age: number
}

/**
 * Nghiệp vụ cats demo — danh sách, tạo mới, route lỗi giả lập (EN: demo cat business logic).
 */
@Injectable()
export class CatService {
    private cats: CatRecord[] = [
        {
            name: "Milo",
            age: 3,
        },
    ]

    /**
     * Trả danh sách mèo hiện có (EN: returns all demo cats).
     *
     * @returns Mảng `CatRecord` (EN: array of cat records).
     */
    findAll(): CatRecord[] {
        return this.cats
    }

    /**
     * Thêm mèo từ DTO — map `breed` → `name` trong model demo (EN: appends a cat; maps DTO `breed` to stored `name` for this simple demo).
     *
     * @param dto - Payload đã validate (EN: validated payload).
     * @returns Bản ghi vừa tạo (EN: newly created record).
     * @sideEffects Push vào mảng `cats` (EN: pushes into `cats`).
     */
    create(dto: CreateCatDto): CatRecord {
        const cat: CatRecord = {
            name: dto.breed,
            age: dto.age,
        }
        this.cats.push(cat)
        return cat
    }

    /**
     * Ném `BadRequestException` cố định Ä‘á»ƒ demo error envelope + docs (EN: throws a fixed `BadRequestException` for error contract demo).
     *
     * @returns Không bao giá» resolve (EN: never returns).
     * @sideEffects Ném exception (EN: always throws).
     */
    triggerDemoError(): never {
        throw new BadRequestException(
            "ÄÃ¢y là lỗi giả lập Ä‘á»ƒ test Unified Error Response",
        )
    }
}
