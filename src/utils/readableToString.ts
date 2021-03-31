/**
 * Return a string of a NodeJS.ReadableStream object
 * @param readable A NodeJS.ReadableStream to be converted to a string
 * @returns A string of the readable stream
 */
export const readableToString = async (readable: NodeJS.ReadableStream) => {
  let result = '';
  for await (const chunk of readable) {
    result += chunk;
  }
  return result;
};
