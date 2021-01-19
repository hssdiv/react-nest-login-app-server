interface TokenPayloadComplete {
    header: {
      alg: string,
      typ: string,
    };
    payload: {
      userId: number,
      roles: string[],
      iat: number,
      exp: number,
    };
    signature: string;
  }