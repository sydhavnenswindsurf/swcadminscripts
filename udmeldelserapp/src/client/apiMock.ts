import { UdmeldtResult } from "../server/types";

export function callGoogleApi(success, error) {
  return {
    getUdmeldelserAdresses: (label: string) =>
      simulateDelay(() =>
        label === "SWC Admin/Udmeldelser"
          ? success([
              {
                name: "testname",
                email: "test@test.dk"
              },
              {
                name: "othertestname",
                email: "othertest@test.dk"
              },
              {
                name: "will fail",
                email: "fail@test.dk"
              }
            ])
          : error(`Der findes ikke nogen email folder med label ${label}`)
      ),
    udmeld: (email: string) =>
      simulateDelay(() =>
        email === "fail@test.dk"
          ? error(`failed to udmelde ${email}`)
          : success(
              email === "test@test.dk"
                ? {
                    email: email,
                    notFound: false,
                    udmeldt: true
                  }
                : {
                    email: email,
                    notFound: true,
                    udmeldt: false
                  }
            )
      )
  };
}

function simulateDelay(action: () => void) {
  setTimeout(action, 500);
}
