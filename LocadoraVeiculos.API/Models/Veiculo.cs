using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LocadoraVeiculos.API.Models
{
    public class Veiculo
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Modelo { get; set; } = string.Empty;

        [Required]
        [Range(1900, 2100)]
        public int AnoFabricacao { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal Quilometragem { get; set; }

        [Required]
        [MaxLength(10)]
        public string Placa { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Cor { get; set; } = string.Empty;

        public bool Disponivel { get; set; } = true;

        [Required]
        public int FabricanteId { get; set; }
        public Fabricante Fabricante { get; set; } = null!;

        [Required]
        public int CategoriaId { get; set; }
        public Categoria Categoria { get; set; } = null!;

        public ICollection<Aluguel> Alugueis { get; set; } = new List<Aluguel>();
    }
}
