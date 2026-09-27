using System;

namespace LocadoraVeiculos.API.DTOs
{
    public class AluguelDetalhadoDto
    {
        public int AluguelId { get; set; }
        public string ClienteNome { get; set; } = string.Empty;
        public string ClienteCPF { get; set; } = string.Empty;
        public string ClienteEmail { get; set; } = string.Empty;
        public string VeiculoModelo { get; set; } = string.Empty;
        public string VeiculoPlaca { get; set; } = string.Empty;
        public string FabricanteNome { get; set; } = string.Empty;
        public string CategoriaNome { get; set; } = string.Empty;
        public DateTime DataInicio { get; set; }
        public DateTime DataFimPrevista { get; set; }
        public DateTime? DataDevolucao { get; set; }
        public decimal QuilometragemInicial { get; set; }
        public decimal? QuilometragemFinal { get; set; }
        public decimal ValorDiaria { get; set; }
        public decimal? ValorTotal { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class FaturamentoCategoriaDto
    {
        public int CategoriaId { get; set; }
        public string CategoriaNome { get; set; } = string.Empty;
        public decimal ValorDiariaPadrao { get; set; }
        public int TotalLocacoes { get; set; }
        public decimal TotalFaturado { get; set; }
        public decimal TicketMedioLocacao { get; set; }
    }

    public class ClienteResumoLocacoesDto
    {
        public int ClienteId { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string CPF { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefone { get; set; } = string.Empty;
        public int TotalAlugueis { get; set; }
        public decimal TotalGasto { get; set; }
        public DateTime? UltimoAluguel { get; set; }
        public string StatusCliente { get; set; } = string.Empty;
    }

    public class VeiculoUtilizacaoDto
    {
        public int VeiculoId { get; set; }
        public string Modelo { get; set; } = string.Empty;
        public string Placa { get; set; } = string.Empty;
        public int AnoFabricacao { get; set; }
        public decimal QuilometragemAtual { get; set; }
        public string Fabricante { get; set; } = string.Empty;
        public string Categoria { get; set; } = string.Empty;
        public bool Disponivel { get; set; }
        public int TotalLocacoes { get; set; }
        public decimal? QuilometragemTotalRodada { get; set; }
        public decimal TotalFaturadoVeiculo { get; set; }
        public DateTime? UltimaLocacao { get; set; }
    }

    public class FabricanteDesempenhoDto
    {
        public int FabricanteId { get; set; }
        public string NomeFabricante { get; set; } = string.Empty;
        public string PaisOrigem { get; set; } = string.Empty;
        public int TotalVeiculosCadastrados { get; set; }
        public int TotalLocacoesRealizadas { get; set; }
        public decimal TotalReceitaGerada { get; set; }
    }
}
