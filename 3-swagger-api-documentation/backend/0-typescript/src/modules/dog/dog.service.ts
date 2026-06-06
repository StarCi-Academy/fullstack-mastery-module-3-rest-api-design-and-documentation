/**
 * Business logic service for Dog.
 */
import {
    Injectable
} from "@nestjs/common"

/** in-memory dog record.
 */
export interface DogRecord {
    name: string
    breed: string
}

/** demo dog business logic — list-only, sufficient for separate Swagger tag.
 */
@Injectable()
export class DogService {
    private dogs: DogRecord[] = [
        {
            name: "Rex",
            breed: "Labrador",
        },
    ]

    /** returns all demo dogs.
     * array of dog records.
     */
    findAll(): DogRecord[] {
        return this.dogs
    }
}
