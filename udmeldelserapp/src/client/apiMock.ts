export function callGoogleApi(success, error) {
  return {
    getUdmeldelserAdresses: (label: string) =>
      setTimeout(
        () =>
          label === "SWC Admin/Udmeldelser"
            ? success([
                {
                  name: "testname",
                  email: "test@test.dk"
                }
              ])
            : error(`Der findes ikke nogen email folder med label ${label}`),
        2000
      )
  };
}
