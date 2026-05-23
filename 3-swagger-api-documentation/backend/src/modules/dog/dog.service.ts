/**
 * Service xu ly logic nghiep vu cua Dog.
 * (EN: Business logic service for Dog.)
 */
import {
    Injectable
} from "@nestjs/common"

/**
 * Bản ghi chó demo trong memory (EN: in-memory dog record).
 */
export interface DogRecord {
    name: string
    breed: string
}

/**
 * Nghiệp vụ dogs demo — chỉ liệt kê, đủ để demo tag riêng trên Swagger
 * (EN: demo dog business logic — list-only, sufficient for separate Swagger tag).
 */
@Injectable()
export class DogService {
    private dogs: DogRecord[] = [
        {
            name: "Rex",
            breed: "Labrador",
        },
    ]

    /**
     * Trả danh sách chó (EN: returns all demo dogs).
     *
     * @returns Mảng `DogRecord` (EN: array of dog records).
     */
    findAll(): DogRecord[] {
        return this.dogs
    }
}
