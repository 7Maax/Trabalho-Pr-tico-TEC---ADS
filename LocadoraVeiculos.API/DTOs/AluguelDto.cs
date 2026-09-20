using System;
using System.ComponentModel.DataAnnotations;

namespace LocadoraVeiculos.API.DTOs
{
    public class AluguelRequestDto
    {
        [Required]
        public int ClienteId { get; set; }

        [Required]
        public int VeiculoId { get; set; }

        [Required]
        public DateTime DataInicio { get; set; }

        [Required]
        public DateTime DataFimPrevista { get; set; }
    }

    public class DevolucaoRequestDto
    {
        [Required]
        public DateTime DataDevolucao { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal QuilometragemFinal { get; set; }
    }

    public class AluguelResponseDto
    {
        public int Id { get; set; }
        public string Cliente { get; set; } = string.Empty;
        public string Veiculo { get; set; } = string.Empty;
        public string Placa { get; set; } = string.Empty;
        public DateTime DataInicio { get; set; }
        public DateTime DataFimPrevista { get; set; }
        public DateTime? DataDevolucao { get; set; }
        public decimal QuilometragemInicial { get; set; }
        public decimal? QuilometragemFinal { get; set; }
        public decimal ValorDiaria { get; set; }
        public decimal? ValorTotal { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
