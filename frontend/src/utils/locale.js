export function getDateLocale(lang) {
  switch (lang) {
    case "ja":
      return "ja-JP";
    case "uk":
      return "uk-UA";
    case "de":
      return "de-DE";
    case "pl":
      return "pl-PL";
    case "ko":
      return "ko-KR";
    default:
      return "en-US";
  }
}
