/**
 * Business logic service for Cat.
 */
import {
    BadRequestException, Injectable 
} from "@nestjs/common"
import {
    CreateCatDto 
} from "./dto/create-cat.dto"

/** in-memory cat record matching lesson `GET /cats` sample.
 */
export interface CatRecord {
    name: string
    age: number
}

/** demo cat business logic.
 */
@Injectable()
export class CatService {
    private cats: CatRecord[] = [
        {
            name: "Milo",
            age: 3,
        },
    ]

    /** returns all demo cats.
     * array of cat records.
     */
    findAll(): CatRecord[] {
        return this.cats
    }

    /** appends a cat; maps DTO `breed` to stored `name` for this simple demo.
     * validated payload.
     * newly created record.
     * pushes into `cats`.
     */
    create(dto: CreateCatDto): CatRecord {
        const cat: CatRecord = {
            name: dto.breed,
            age: dto.age,
        }
        this.cats.push(cat)
        return cat
    }

    /** throws a fixed `BadRequestException` for error contract demo.
     * never returns.
     * always throws.
     */
    triggerDemoError(): never {
        // Always throw so students can see the unified error envelope in action.
        throw new BadRequestException(
            "Simulated error for Unified Error Response demo",
        )
    }
}
