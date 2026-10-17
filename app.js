const express=require('express');
const path=require('path');
const fs=require('fs');
const app=express();
const PORT=process.env.PORT||3000;
app.set('view engine','ejs'); app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use('/bootstrap',express.static(path.join(__dirname,'node_modules/bootstrap/dist')));
app.use(express.static(path.join(__dirname,'public')));
const cfg={
clientes:{titulo:'Clientes',campos:[['nome','Nome','text'],['email','E-mail','email'],['telefone','Telefone','text']]},
fornecedores:{titulo:'Fornecedores',campos:[['nome','Nome / Empresa','text'],['email','E-mail','email'],['telefone','Telefone','text']]},
produtos:{titulo:'Produtos',campos:[['nome','Nome do produto','text'],['preco','Preço','number'],['estoque','Estoque','number']]}
};
function file(e){return path.join(__dirname,'data',e+'.json')}
function read(e){if(!fs.existsSync(file(e)))fs.writeFileSync(file(e),'[]');return JSON.parse(fs.readFileSync(file(e),'utf8'))}
function save(e,d){fs.writeFileSync(file(e),JSON.stringify(d,null,2))}
function valid(e){return !!cfg[e]}
app.get('/',(req,res)=>res.render('index',{nomes:['Eloá Braz','João Victor Guidi']}));
app.get('/:e',(req,res)=>{let e=req.params.e;if(!valid(e))return res.status(404).send('Página não encontrada');res.render('lista',{e,c:cfg[e],dados:read(e),msg:req.query.msg||''})});
app.get('/:e/novo',(req,res)=>{let e=req.params.e;if(!valid(e))return res.status(404).send('Página não encontrada');res.render('form',{e,c:cfg[e],item:{},acao:`/${e}`})});
app.post('/:e',(req,res)=>{let e=req.params.e;if(!valid(e))return res.status(404).send('Página não encontrada');let d=read(e),id=d.length?Math.max(...d.map(x=>+x.id))+1:1;d.push({id,...req.body});save(e,d);res.redirect(`/${e}?msg=Cadastrado com sucesso!`)});
app.get('/:e/editar/:id',(req,res)=>{let e=req.params.e;if(!valid(e))return res.status(404).send('Página não encontrada');let item=read(e).find(x=>String(x.id)===req.params.id);if(!item)return res.status(404).send('Registro não encontrado');res.render('form',{e,c:cfg[e],item,acao:`/${e}/editar/${req.params.id}`})});
app.post('/:e/editar/:id',(req,res)=>{let e=req.params.e;if(!valid(e))return res.status(404).send('Página não encontrada');let d=read(e),i=d.findIndex(x=>String(x.id)===req.params.id);if(i<0)return res.status(404).send('Registro não encontrado');d[i]={id:+req.params.id,...req.body};save(e,d);res.redirect(`/${e}?msg=Alterado com sucesso!`)});
app.post('/:e/excluir/:id',(req,res)=>{let e=req.params.e;if(!valid(e))return res.status(404).send('Página não encontrada');save(e,read(e).filter(x=>String(x.id)!==req.params.id));res.redirect(`/${e}?msg=Excluído com sucesso!`)});
app.use((req,res)=>res.status(404).send('Página não encontrada'));
app.listen(PORT,()=>console.log(`Servidor: http://localhost:${PORT}`));