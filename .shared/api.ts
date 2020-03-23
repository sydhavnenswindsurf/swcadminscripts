declare var google: {
  script: {
    run: any;
  };
};
export function callGoogleApi<T>(
  success: (data: T) => void,
  failure?: (message: string) => void
): any {
  return google.script.run
    .withSuccessHandler(success)
    .withFailureHandler(failure);
}
