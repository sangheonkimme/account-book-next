export const getTypeColor = (type: string | undefined): string => {
  switch (type) {
    case "income":
      return "#12b886";
    case "expense":
      return "#fa5252";
    case "saving":
      return "#228be6";
    default:
      return "black";
  }
};
