import { createRewindTheater } from "@rewind/web-player/rewind";

const apiUrl = "http://localhost:7271";
export const theater = createRewindTheater({ apiUrl });
