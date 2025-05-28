export function getDiscordRelativeTime(date: Date) {
    const unixTimestamp = Math.floor(date.getTime() / 1000);
    return `<t:${unixTimestamp}:R>`;
}

export function truncateString(input: string, maxLength: number): string {
    if (input.length <= maxLength) return input;
    return input.slice(0, maxLength - 3) + '...';
}