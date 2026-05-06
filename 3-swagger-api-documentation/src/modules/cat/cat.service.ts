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
 * Báº£n ghi mÃ¨o demo trong memory (khá»›p response `GET /cats` trong giÃ¡o trÃ¬nh) (EN: in-memory cat record matching lesson `GET /cats` sample).
 */
export interface CatRecord {
    name: string
    age: number
}

/**
 * Nghiá»‡p vá»¥ cats demo â€” danh sÃ¡ch, táº¡o má»›i, route lá»—i giáº£ láº­p (EN: demo cat business logic).
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
     * Tráº£ danh sÃ¡ch mÃ¨o hiá»‡n cÃ³ (EN: returns all demo cats).
     *
     * @returns Máº£ng `CatRecord` (EN: array of cat records).
     */
    findAll(): CatRecord[] {
        return this.cats
    }

    /**
     * ThÃªm mÃ¨o tá»« DTO â€” map `breed` â†’ `name` trong model demo (EN: appends a cat; maps DTO `breed` to stored `name` for this simple demo).
     *
     * @param dto - Payload Ä‘Ã£ validate (EN: validated payload).
     * @returns Báº£n ghi vá»«a táº¡o (EN: newly created record).
     * @sideEffects Push vÃ o máº£ng `cats` (EN: pushes into `cats`).
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
     * NÃ©m `BadRequestException` cá»‘ Ä‘á»‹nh Ä‘á»ƒ demo error envelope + docs (EN: throws a fixed `BadRequestException` for error contract demo).
     *
     * @returns KhÃ´ng bao giá» resolve (EN: never returns).
     * @sideEffects NÃ©m exception (EN: always throws).
     */
    triggerDemoError(): never {
        throw new BadRequestException(
            "ÄÃ¢y lÃ  lá»—i giáº£ láº­p Ä‘á»ƒ test Unified Error Response",
        )
    }
}
