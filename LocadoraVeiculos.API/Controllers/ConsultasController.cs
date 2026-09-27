using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LocadoraVeiculos.API.Data;
using LocadoraVeiculos.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConsultasController : ControllerBase
    {
        private readonly LocadoraContext _context;

        public ConsultasController(LocadoraContext context)
        {
            _context = context;
        }

        [HttpGet("alugueis-detalhados")]
        public async Task<ActionResult<IEnumerable<AluguelDetalhadoDto>>> GetAlugueisDetalhados(
            [FromQuery] string? clienteNome,
            [FromQuery] string? modelo,
            [FromQuery] string? fabricanteNome,
            [FromQuery] string? status,
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim)
        {
            var query = from a in _context.Alugueis
                        join c in _context.Clientes on a.ClienteId equals c.Id
                        join v in _context.Veiculos on a.VeiculoId equals v.Id
                        join f in _context.Fabricantes on v.FabricanteId equals f.Id
                        join cat in _context.Categorias on v.CategoriaId equals cat.Id
                        select new
                        {
                            Aluguel = a,
                            Cliente = c,
                            Veiculo = v,
                            Fabricante = f,
                            Categoria = cat
                        };

            if (!string.IsNullOrWhiteSpace(clienteNome))
                query = query.Where(x => x.Cliente.Nome.Contains(clienteNome));

            if (!string.IsNullOrWhiteSpace(modelo))
                query = query.Where(x => x.Veiculo.Modelo.Contains(modelo));

            if (!string.IsNullOrWhiteSpace(fabricanteNome))
                query = query.Where(x => x.Fabricante.Nome.Contains(fabricanteNome));

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(x => x.Aluguel.Status == status);

            if (dataInicio.HasValue)
                query = query.Where(x => x.Aluguel.DataInicio >= dataInicio.Value);

            if (dataFim.HasValue)
                query = query.Where(x => x.Aluguel.DataInicio <= dataFim.Value);

            var resultado = await query.Select(x => new AluguelDetalhadoDto
            {
                AluguelId = x.Aluguel.Id,
                ClienteNome = x.Cliente.Nome,
                ClienteCPF = x.Cliente.CPF,
                ClienteEmail = x.Cliente.Email,
                VeiculoModelo = x.Veiculo.Modelo,
                VeiculoPlaca = x.Veiculo.Placa,
                FabricanteNome = x.Fabricante.Nome,
                CategoriaNome = x.Categoria.Nome,
                DataInicio = x.Aluguel.DataInicio,
                DataFimPrevista = x.Aluguel.DataFimPrevista,
                DataDevolucao = x.Aluguel.DataDevolucao,
                QuilometragemInicial = x.Aluguel.QuilometragemInicial,
                QuilometragemFinal = x.Aluguel.QuilometragemFinal,
                ValorDiaria = x.Aluguel.ValorDiaria,
                ValorTotal = x.Aluguel.ValorTotal,
                Status = x.Aluguel.Status
            }).ToListAsync();

            return Ok(resultado);
        }

        [HttpGet("faturamento-por-categoria")]
        public async Task<ActionResult<IEnumerable<FaturamentoCategoriaDto>>> GetFaturamentoPorCategoria(
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim)
        {
            var query = from cat in _context.Categorias
                        join v in _context.Veiculos on cat.Id equals v.CategoriaId
                        join a in _context.Alugueis on v.Id equals a.VeiculoId
                        where a.Status == "Concluido"
                        select new { Categoria = cat, Aluguel = a };

            if (dataInicio.HasValue)
                query = query.Where(x => x.Aluguel.DataInicio >= dataInicio.Value);

            if (dataFim.HasValue)
                query = query.Where(x => x.Aluguel.DataInicio <= dataFim.Value);

            var agrupado = await query
                .GroupBy(x => new { x.Categoria.Id, x.Categoria.Nome, x.Categoria.ValorDiaria })
                .Select(g => new FaturamentoCategoriaDto
                {
                    CategoriaId = g.Key.Id,
                    CategoriaNome = g.Key.Nome,
                    ValorDiariaPadrao = g.Key.ValorDiaria,
                    TotalLocacoes = g.Count(),
                    TotalFaturado = g.Sum(x => x.Aluguel.ValorTotal ?? 0),
                    TicketMedioLocacao = g.Count() > 0 ? (g.Sum(x => x.Aluguel.ValorTotal ?? 0) / g.Count()) : 0
                })
                .OrderByDescending(r => r.TotalFaturado)
                .ToListAsync();

            return Ok(agrupado);
        }

        [HttpGet("clientes-resumo-locacoes")]
        public async Task<ActionResult<IEnumerable<ClienteResumoLocacoesDto>>> GetClientesResumo(
            [FromQuery] bool? apenasSemAluguel,
            [FromQuery] string? termoBusca)
        {
            var query = from c in _context.Clientes
                        join a in _context.Alugueis on c.Id equals a.ClienteId into alugueisJoin
                        from a in alugueisJoin.DefaultIfEmpty()
                        select new { Cliente = c, Aluguel = a };

            if (!string.IsNullOrWhiteSpace(termoBusca))
                query = query.Where(x => x.Cliente.Nome.Contains(termoBusca) || x.Cliente.CPF.Contains(termoBusca) || x.Cliente.Email.Contains(termoBusca));

            var resultadoAgrupado = await query
                .GroupBy(x => new { x.Cliente.Id, x.Cliente.Nome, x.Cliente.CPF, x.Cliente.Email, x.Cliente.Telefone })
                .Select(g => new ClienteResumoLocacoesDto
                {
                    ClienteId = g.Key.Id,
                    Nome = g.Key.Nome,
                    CPF = g.Key.CPF,
                    Email = g.Key.Email,
                    Telefone = g.Key.Telefone,
                    TotalAlugueis = g.Count(x => x.Aluguel != null),
                    TotalGasto = g.Sum(x => x.Aluguel != null ? (x.Aluguel.ValorTotal ?? 0) : 0),
                    UltimoAluguel = g.Max(x => x.Aluguel != null ? (DateTime?)x.Aluguel.DataInicio : null),
                    StatusCliente = g.Any(x => x.Aluguel != null) ? "Ativo com Locações" : "Sem Locações Realizadas"
                })
                .ToListAsync();

            if (apenasSemAluguel.HasValue)
            {
                resultadoAgrupado = apenasSemAluguel.Value
                    ? resultadoAgrupado.Where(x => x.TotalAlugueis == 0).ToList()
                    : resultadoAgrupado.Where(x => x.TotalAlugueis > 0).ToList();
            }

            return Ok(resultadoAgrupado);
        }

        [HttpGet("veiculos-utilizacao")]
        public async Task<ActionResult<IEnumerable<VeiculoUtilizacaoDto>>> GetVeiculosUtilizacao(
            [FromQuery] int? categoriaId,
            [FromQuery] int? fabricanteId,
            [FromQuery] bool? apenasNuncaAlugados,
            [FromQuery] bool? disponivel)
        {
            var query = from v in _context.Veiculos
                        join f in _context.Fabricantes on v.FabricanteId equals f.Id
                        join cat in _context.Categorias on v.CategoriaId equals cat.Id
                        join a in _context.Alugueis on v.Id equals a.VeiculoId into alugueisJoin
                        from a in alugueisJoin.DefaultIfEmpty()
                        select new
                        {
                            Veiculo = v,
                            Fabricante = f,
                            Categoria = cat,
                            Aluguel = a
                        };

            if (categoriaId.HasValue)
                query = query.Where(x => x.Veiculo.CategoriaId == categoriaId.Value);

            if (fabricanteId.HasValue)
                query = query.Where(x => x.Veiculo.FabricanteId == fabricanteId.Value);

            if (disponivel.HasValue)
                query = query.Where(x => x.Veiculo.Disponivel == disponivel.Value);

            var resultadoAgrupado = await query
                .GroupBy(x => new
                {
                    x.Veiculo.Id,
                    x.Veiculo.Modelo,
                    x.Veiculo.Placa,
                    x.Veiculo.AnoFabricacao,
                    x.Veiculo.Quilometragem,
                    x.Veiculo.Disponivel,
                    FabricanteNome = x.Fabricante.Nome,
                    CategoriaNome = x.Categoria.Nome
                })
                .Select(g => new VeiculoUtilizacaoDto
                {
                    VeiculoId = g.Key.Id,
                    Modelo = g.Key.Modelo,
                    Placa = g.Key.Placa,
                    AnoFabricacao = g.Key.AnoFabricacao,
                    QuilometragemAtual = g.Key.Quilometragem,
                    Fabricante = g.Key.FabricanteNome,
                    Categoria = g.Key.CategoriaNome,
                    Disponivel = g.Key.Disponivel,
                    TotalLocacoes = g.Count(x => x.Aluguel != null),
                    QuilometragemTotalRodada = g.Sum(x => (x.Aluguel != null && x.Aluguel.QuilometragemFinal.HasValue) ? (x.Aluguel.QuilometragemFinal.Value - x.Aluguel.QuilometragemInicial) : 0),
                    TotalFaturadoVeiculo = g.Sum(x => x.Aluguel != null ? (x.Aluguel.ValorTotal ?? 0) : 0),
                    UltimaLocacao = g.Max(x => x.Aluguel != null ? (DateTime?)x.Aluguel.DataInicio : null)
                })
                .ToListAsync();

            if (apenasNuncaAlugados.HasValue)
            {
                resultadoAgrupado = apenasNuncaAlugados.Value
                    ? resultadoAgrupado.Where(x => x.TotalLocacoes == 0).ToList()
                    : resultadoAgrupado.Where(x => x.TotalLocacoes > 0).ToList();
            }

            return Ok(resultadoAgrupado);
        }

        [HttpGet("fabricantes-desempenho")]
        public async Task<ActionResult<IEnumerable<FabricanteDesempenhoDto>>> GetFabricantesDesempenho(
            [FromQuery] string? paisOrigem,
            [FromQuery] string? nome)
        {
            var query = from f in _context.Fabricantes
                        join v in _context.Veiculos on f.Id equals v.FabricanteId into veiculosJoin
                        from v in veiculosJoin.DefaultIfEmpty()
                        join a in _context.Alugueis on (v != null ? v.Id : 0) equals a.VeiculoId into alugueisJoin
                        from a in alugueisJoin.DefaultIfEmpty()
                        select new
                        {
                            Fabricante = f,
                            Veiculo = v,
                            Aluguel = a
                        };

            if (!string.IsNullOrWhiteSpace(paisOrigem))
                query = query.Where(x => x.Fabricante.PaisOrigem.Contains(paisOrigem));

            if (!string.IsNullOrWhiteSpace(nome))
                query = query.Where(x => x.Fabricante.Nome.Contains(nome));

            var resultado = await query
                .GroupBy(x => new { x.Fabricante.Id, x.Fabricante.Nome, x.Fabricante.PaisOrigem })
                .Select(g => new FabricanteDesempenhoDto
                {
                    FabricanteId = g.Key.Id,
                    NomeFabricante = g.Key.Nome,
                    PaisOrigem = g.Key.PaisOrigem,
                    TotalVeiculosCadastrados = g.Select(x => x.Veiculo != null ? x.Veiculo.Id : 0).Where(id => id > 0).Distinct().Count(),
                    TotalLocacoesRealizadas = g.Count(x => x.Aluguel != null),
                    TotalReceitaGerada = g.Sum(x => x.Aluguel != null ? (x.Aluguel.ValorTotal ?? 0) : 0)
                })
                .OrderByDescending(r => r.TotalReceitaGerada)
                .ToListAsync();

            return Ok(resultado);
        }
    }
}

