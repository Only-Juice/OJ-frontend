export type QuestionScript = {
  compile_script: string;
  execute_script: string;
  score_script: string;
  score_map:string;
};

export type QuestionLimit = {
    memory : number;
    stack_memory : number;
    time : number;
    wall_time : number;
    file_size : number;
    processes : number;
    open_files : number;
}