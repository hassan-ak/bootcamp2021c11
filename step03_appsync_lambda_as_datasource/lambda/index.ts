type AppSyncEvent = {
  info: {
    fieldName: String;
  };
};

exports.handler = async (event: AppSyncEvent) => {
  const notesArray = ["note1", "note2", "note3"];

  switch (event.info.fieldName) {
    case "notes":
      return notesArray;
    default:
      return null;
  }
};
