import { createRewindTheater } from "@rewind/web-player/rewind";
import { environment } from "../environments/environment";

const apiUrl = environment.url;
export const theater = createRewindTheater({ apiUrl });
