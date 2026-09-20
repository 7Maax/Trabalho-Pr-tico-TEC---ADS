using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LocadoraVeiculos.API.Models
{
    public class Aluguel
    {
        public int Id { get; set; }

        [Required]
        public DateTime DataInicio { get; set; }

        [Required]
        public DateTime DataFimPrevista { get; set; }

        public DateTime? DataDevolucao { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal QuilometragemInicial { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? QuilometragemFinal { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal ValorDiaria { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? ValorTotal { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Ativo";

        [Required]
        public int ClienteId { get; set; }
        public Cliente Cliente { get; set; } = null!;

        [Required]
        public int VeiculoId { get; set; }
        public Veiculo Veiculo { get; set; } = null!;
    }
}
