using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LocadoraVeiculos.API.Models
{
    public class Fabricante
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(100)]
        public string PaisOrigem { get; set; } = string.Empty;

        public ICollection<Veiculo> Veiculos { get; set; } = new List<Veiculo>();
    }
}
