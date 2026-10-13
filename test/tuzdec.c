#include <stdio.h>
#include <stdlib.h>
#include "decompress/tuz_dec.h"
int main(int argc,char**argv){
  FILE*f=fopen(argv[1],"rb"); fseek(f,0,2); long n=ftell(f); rewind(f);
  unsigned char*in=malloc(n); fread(in,1,n,f); fclose(f);
  tuz_size_t outsz=(tuz_size_t)atol(argv[2]); unsigned char*out=malloc(outsz+16); tuz_size_t got=outsz;
  tuz_TResult r=tuz_decompress_mem(in,n,out,&got);
  if(r!=tuz_STREAM_END){fprintf(stderr,"decode error %d\n",r);return 2;}
  fwrite(out,1,got,stdout); return 0;}
