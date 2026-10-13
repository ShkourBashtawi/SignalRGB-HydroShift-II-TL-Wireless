#include <cstdio>
#include <cstdlib>
#include <vector>
extern "C" size_t tuz_compress_mem(const unsigned char*,size_t,unsigned char*,size_t,size_t);
int main(int c,char**v){FILE*f=fopen(v[1],"rb");std::vector<unsigned char> d;int ch;while((ch=fgetc(f))!=EOF)d.push_back(ch);
std::vector<unsigned char> o(d.size()*2+64);size_t n=tuz_compress_mem(d.data(),d.size(),o.data(),o.size(),4096);fwrite(o.data(),1,n,stdout);}
