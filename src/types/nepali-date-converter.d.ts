declare module 'nepali-date-converter' {
    export default class NepaliDate {
        constructor(date?: Date | string | number);
        format(formatString: string): string;
        getYear(): number;
        getMonth(): number;
        getDate(): number;
        toJsDate(): Date;
    }
}
