export const log = (message: string, data?: any) => {
    console.log(message, data ? JSON.stringify(data) : '');
  };
  