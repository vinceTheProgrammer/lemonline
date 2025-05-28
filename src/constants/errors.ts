export enum ErrorType {
    Error = 'error',
    Warning = 'warning',
    Note = 'note'
}

export enum ErrorMessage {
    GuildNotDefined = "Error encountered because guild is not defined. (Are you running a command/function in DMs?)",
    MemberNotDefined = "Error encountered because member is not defined. This usually means the user could not be associated with any particular guild. (Are you running a command/function in DMs?)",
    MissingAccess = "Error encountered because of a permission issue."
}