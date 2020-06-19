export type Job = { resolve: (value: any) => void, reject: (reason: any) => void };
export type Jobs = { [id: string]: Job };

export const assignJob = <T>(
  jobs: { [p: string]: { resolve: (value: any) => void; reject: (reason: any) => void } },
  id: string
) => {
  return new Promise<T>((resolve, reject) => {
    jobs[id] = { resolve, reject };
  });
};

export const resolveJob = (
  jobs: { [p: string]: { resolve: (value: any) => void; reject: (reason: any) => void } },
  id: string,
  value: any
) => {
  try {
    return jobs[id].resolve(value);
  } finally {
    delete jobs[id];
  }
};


